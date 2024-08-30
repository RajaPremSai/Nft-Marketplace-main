import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { Fade, TextField } from "@mui/material";
import Backdrop from '@mui/material/Backdrop';

export function SellModal({open,handleClose,tokenId,listNft}) {
    const [priceInUSD, setPriceInUSD] = useState('');
    const [arbitrer, setArbitrer] = useState('');
    const handleListNFT = () => {
        const arbitrerAddress = arbitrer || '0x0000000000000000000000000000000000000000';
        listNft(tokenId, priceInUSD, arbitrerAddress);
        handleClose();
      };

      const handleModalClose = () => {
        setPriceInUSD('');
        setArbitrer('');
        handleClose();
      };

  return (
    <Modal
        open={open}
        onClose={handleModalClose}
        onTransitionExited={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}> 
        <div className="bg-black text-white w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2">
        <div className="flex justify-between bg-primary bg-gradient-to-r from-primary text-white  p-6">
              <div >
                <h1 id="modal-modal-title" className="text-2xl font-semibold mb-4">
                  List An NFTee
                </h1>
                <h2>#{tokenId}</h2>
                <h2>#{priceInUSD}</h2>
                <h2>#{arbitrer}</h2>
              </div>
              
            </div>

              <div className="p-8">
              <TextField
                margin="dense"
                id="name"
                label="Price in USD"
                type="number"
                fullWidth
                required
                variant="outlined"
                focused
                onChange={(e) => setPriceInUSD(e.target.value)}
                InputProps={{
                  style: { color: 'white' },
                }}
                InputLabelProps={{
                  style: { color: 'white' },
                }}
                className="mb-4 border-2"
              />
              <TextField
                margin="dense"
                id="name"
                label="Arbitrer address"
                type="text"
                fullWidth
                focused
                variant="outlined"
                onChange={(e) => setArbitrer(e.target.value)}
                InputProps={{
                  style: { color: 'white' },
                }}
                InputLabelProps={{
                  style: { color: 'white' },
                }}
                className="mb-4"
              />
              
              <button onClick={handleListNFT}
                className="bg-blue-500 mt-5 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded mb-2 w-full"
              >
                LIST NFT
              </button>
              <Button onClick={handleClose} variant="outlined" className="w-full text-white border-white hover:bg-white hover:text-black">
                Close
              </Button>
              </div>
            </div>
            </Fade>
      </Modal>
  )
}
