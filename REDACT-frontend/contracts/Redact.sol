// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

contract Redact {
    // Struct to store both originalLink and certificateLink
    struct LinkInfo {
        string originalLink;
        string certificateLink;
    }

    mapping(string => LinkInfo) private maskedToLinkInfo;
    mapping(string => string[]) private usernameToLinks;
    string[] private usernames;

    // Salt for hashing, initialized through the constructor
    string private salt;

    // Event to log when a link is masked
    event LinkMasked(string indexed username, string maskedLink, string originalLink, string certificateLink, uint timestamp);

    // Constructor to initialize the salt
    constructor(string memory initialSalt) {
        salt = initialSalt;
    }

    // Function to store image on IPFS and get back the link
    // This is a placeholder function. In a real-world scenario, 
    // you'd integrate with an IPFS service.
    function imageToLink(string memory image) internal view returns (string memory) {
        // Concatenate the image string with salt
        string memory saltedImage = string(abi.encodePacked(image, salt));

        // Hash the salted image string using keccak256
        bytes32 hash = keccak256(abi.encodePacked(saltedImage));

        // Convert hash to string
        return toHexString(hash);
    }

    // Function to mask an IPFS link
    function mask(string memory username, string memory originalLink, string memory maskedLink, string memory certificateLink) public returns (string memory) {
        // Ensure the username exists
        require(usernameExists(username), "Username does not exist");

        // Store the masked link, original link, and certificate link in the mapping
        maskedToLinkInfo[maskedLink] = LinkInfo(originalLink, certificateLink);

        // Store the masked link in the user's list of links
        usernameToLinks[username].push(maskedLink);

        // Emit the event with the current timestamp
        emit LinkMasked(username, maskedLink, originalLink, certificateLink, block.timestamp);

        return maskedLink;
    }

    // Function to demask a link and get both original and certificate links
    function demask(string memory maskedLink) public view returns (string memory, string memory) {
        // Validate the link
        require(validate(maskedLink), "Invalid masked link");

        // Return the original and certificate links
        LinkInfo memory linkInfo = maskedToLinkInfo[maskedLink];
        return (linkInfo.originalLink, linkInfo.certificateLink);
    }

    // Function to validate if a masked link exists
    function validate(string memory maskedLink) public view returns (bool) {
        // Check if the masked link exists in the mapping
        return bytes(maskedToLinkInfo[maskedLink].originalLink).length > 0;
    }

    // Utility function to check if a username exists
    function usernameExists(string memory username) internal view returns (bool) {
        for (uint i = 0; i < usernames.length; i++) {
            if (keccak256(abi.encodePacked(usernames[i])) == keccak256(abi.encodePacked(username))) {
                return true;
            }
        }
        return false;
    }

    // Function to add a new user and get a username
    function addUser(string memory username) public returns (string memory) {
        require(!usernameExists(username), "Username already exists");
        usernames.push(username);
        return username;
    }

    // Function to get the list of masked links for a user
    function getUserLinks(string memory username) public view returns (string[] memory) {
        return usernameToLinks[username];
    }

    // Setter functions

    // Setter for salt
    function setSalt(string memory newSalt) public {
        salt = newSalt;
    }

    // Setter for maskedToLinkInfo mapping (for a specific maskedLink)
    function setMaskedToLinkInfo(string memory maskedLink, string memory originalLink, string memory certificateLink) public {
        maskedToLinkInfo[maskedLink] = LinkInfo(originalLink, certificateLink);
    }

    // Setter for usernameToLinks mapping (for a specific username)
    function setUserLinks(string memory username, string[] memory links) public {
        usernameToLinks[username] = links;
    }

    // Setter for usernames array
    function setUsernames(string[] memory newUsernames) public {
        usernames = newUsernames;
    }

    // Getter functions

    // Getter for salt
    function getSalt() public view returns (string memory) {
        return salt;
    }

    // Getter for maskedToLinkInfo mapping (for a specific maskedLink)
    function getLinkInfo(string memory maskedLink) public view returns (string memory, string memory) {
        LinkInfo memory linkInfo = maskedToLinkInfo[maskedLink];
        return (linkInfo.originalLink, linkInfo.certificateLink);
    }

    // Getter for usernameToLinks mapping (for a specific username)
    function getUserLinksByUsername(string memory username) public view returns (string[] memory) {
        return usernameToLinks[username];
    }

    // Getter for usernames array
    function getUsernames() public view returns (string[] memory) {
        return usernames;
    }

    // Utility function to convert bytes32 to a hex string
    function toHexString(bytes32 data) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint i = 0; i < 32; i++) {
            str[2*i] = hexChars[uint8(data[i] >> 4)];
            str[2*i + 1] = hexChars[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
}
