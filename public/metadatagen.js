var fs = require('fs');

for (var i = 1; i < 20; i++) {
  var json = {}
  json.name = "Token #" + i;
  json.description = "This is the description for token #" + i;
  json.image = "ipfs://QmV6zHBQaGQF7AV2tXPjf7ML21kAvHN1yiFc9qrX3gWCmz/" + i + ".jpg";

  fs.writeFileSync('' + i+ ".json", JSON.stringify(json));
}