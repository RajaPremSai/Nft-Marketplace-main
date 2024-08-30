// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTMarketplace is Ownable(msg.sender), AccessControl, ReentrancyGuard, ChainlinkClient {
    using Chainlink for Chainlink.Request;

    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");

    uint256 private constant ORACLE_PAYMENT = 1 * 10**18;
    uint256 public ethPrice;
    uint256 public listingFee = 0.01 ether;
    uint256 private constant DECIMALS = 18;
    uint256 private constant SCALING_FACTOR = 10 ** DECIMALS;

    ERC721Enumerable public nftCollection;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        address arbiter;
        uint256 listingTime;
        bool isSold;
    }

    Listing[] public listings;
    mapping(uint256 => uint256) public tokenIdToListingIndex;
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    event RequestEthPrice(bytes32 indexed requestId, uint256 price);
    event NFTListed(uint256 tokenId, address seller, uint256 price, address arbiter);
    event NFTSold(uint256 tokenId, address buyer, uint256 priceETH);
    event DisputeRaised(uint256 tokenId, address arbiter);
    event SaleFinalized(uint256 tokenId, address buyer);
    event EthPriceUpdated(uint256 ethPrice);
    event RequestSent(bytes32 indexed requestId);

    constructor(address _nftCollection) {
        _setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
        _setChainlinkOracle(0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD);
        jobId = "ca98366cc7314957b8c012c72f05aeeb";
        fee = (1 * LINK_DIVISIBILITY) / 10;
        nftCollection = ERC721Enumerable(_nftCollection);
    }

    function getSellerNftListigs() public view returns (Listing[] memory) {
        uint totalListings = listings.length;
        uint count = 0;
        for (uint i = 0; i < totalListings; i++) {
            if (listings[i].seller == msg.sender) {
                count++;
            }
        }

        Listing[] memory sellerListings = new Listing[](count);
        uint index = 0;
        for (uint i = 0; i < totalListings; i++) {
            if (listings[i].seller == msg.sender) {
                sellerListings[index] = listings[i];
                index++;
            }
        }

        return sellerListings;
    }

    function getNftListigs() public view returns (Listing[] memory) {
        return listings;
    }

    function listNFT(uint256 tokenId, uint256 priceUSD, address arbiter) public payable nonReentrant {
        require(msg.value == listingFee, "Listing fee required");
        require(nftCollection.ownerOf(tokenId) == msg.sender, "Only owner can list");
        require(nftCollection.isApprovedForAll(msg.sender, address(this)) || nftCollection.getApproved(tokenId) == address(this), "Marketplace not approved");

        if (!nftCollection.isApprovedForAll(msg.sender, address(this))) {
            nftCollection.approve(address(this), tokenId);
        }

        reqEthPrice();

        uint256 priceETH = (priceUSD * SCALING_FACTOR * SCALING_FACTOR / ethPrice);
        listings.push(Listing(tokenId, msg.sender, priceETH, arbiter, block.timestamp, false));
        tokenIdToListingIndex[tokenId] = listings.length - 1;

        nftCollection.transferFrom(msg.sender, address(this), tokenId);

        emit NFTListed(tokenId, msg.sender, priceETH, arbiter);
    }

    function revertListing(uint tokenId) public nonReentrant {
        uint256 index = tokenIdToListingIndex[tokenId];
        require(listings[index].seller == msg.sender, "Not authorized to perform this action");

        // Transfer NFT back to seller
        nftCollection.transferFrom(address(this), msg.sender, tokenId);

        // Swap the listing with the last one and remove the last element
        uint256 lastIndex = listings.length - 1;

        // Only perform swap if the listing to remove is not the last one
        if (index != lastIndex) {
            Listing storage lastListing = listings[lastIndex];

            // Update the mapping for the swapped token ID
            tokenIdToListingIndex[lastListing.tokenId] = index;

            // Perform the swap
            listings[index] = lastListing;
        }

        // Remove the last element
        listings.pop();

        // Remove the mapping entry
        delete tokenIdToListingIndex[tokenId];
    }

    function buyNFT(uint256 tokenId) public payable nonReentrant {
        uint256 index = tokenIdToListingIndex[tokenId];
        Listing storage listing = listings[index];
        require(!listing.isSold, "NFT already sold");
        require(msg.value >= listing.price / 10**18, "Insufficient ETH sent");

        uint256 commission = (msg.value * 10) / 100;
        payable(listing.seller).transfer(msg.value - commission);
        payable(owner()).transfer(commission);
        nftCollection.transferFrom(address(this), msg.sender, tokenId);

        listing.isSold = true;

        // Swap the listing with the last one and remove the last element
        uint256 lastIndex = listings.length - 1;

        // Only perform swap if the listing to remove is not the last one
        if (index != lastIndex) {
            Listing storage lastListing = listings[lastIndex];

            // Update the mapping for the swapped token ID
            tokenIdToListingIndex[lastListing.tokenId] = index;

            // Perform the swap
            listings[index] = lastListing;
        }

        // Remove the last element
        listings.pop();

        // Remove the mapping entry
        delete tokenIdToListingIndex[tokenId];

        emit NFTSold(tokenId, msg.sender, msg.value);
    }

    function reqEthPrice() public returns (bytes32 requestId) {
        Chainlink.Request memory request = _buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        request._add("get", "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD");
        request._add("path", "RAW,ETH,USD,PRICE");
        int256 timesAmount = 10 ** 18;
        request._addInt("times", timesAmount);
        emit RequestSent(requestId);
        return _sendChainlinkRequest(request, fee);
    }

    function fulfill(bytes32 _requestId, uint256 _ethPrice) public recordChainlinkFulfillment(_requestId) {
        emit RequestEthPrice(_requestId, _ethPrice);
        ethPrice = _ethPrice;
        emit EthPriceUpdated(_ethPrice);
    }

    function disputeSale(uint256 tokenId) public {
        uint256 index = tokenIdToListingIndex[tokenId];
        Listing storage listing = listings[index];
        require(listing.arbiter==msg.sender, "Caller is not an arbiter");
    
        require(block.timestamp <= listing.listingTime + 1 days, "Dispute period over");

        listing.isSold = false;
        nftCollection.transferFrom(address(this), listing.seller, tokenId);

        // Swap the listing with the last one and remove the last element
        uint256 lastIndex = listings.length - 1;

        // Only perform swap if the listing to remove is not the last one
        if (index != lastIndex) {
            Listing storage lastListing = listings[lastIndex];

            // Update the mapping for the swapped token ID
            tokenIdToListingIndex[lastListing.tokenId] = index;

            // Perform the swap
            listings[index] = lastListing;
        }

        // Remove the last element
        listings.pop();

        // Remove the mapping entry
        delete tokenIdToListingIndex[tokenId];

        emit DisputeRaised(tokenId, msg.sender);
    }

    function finalizeSale(uint256 tokenId) public {
        uint256 index = tokenIdToListingIndex[tokenId];
        Listing storage listing = listings[index];
        require(block.timestamp > listing.listingTime + 1 days, "Dispute period not over");

        emit SaleFinalized(tokenId, msg.sender);
    }

    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }

    receive() external payable {}

    fallback() external payable {}

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
