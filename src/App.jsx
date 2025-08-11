import React , {useState} from 'react'
import  {ethers} from 'ethers';
import {pinata} from './config'
const App = () => {
  const [selectedFile,setSelectedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");
  const [storedHash,setStoredHash] = useState("");

  const contractAddress = "0x0dda53d0d42c0082e329df082cec617d12cefc80";
  const contractAbi = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_ipfshash",
          "type": "string"
        }
      ],
      "name": "setIPFSHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getIPFSHash",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);

  }

 
  const handleSubmit = async () => {
    try {
      if (!selectedFile) {
        // console.error("No file selected");
        alert("Please Select A File FIrst");
        return;
      }
  
      const url = 'pinata-url'; // Replace with your Pinata upload URL
  
      let data = new FormData();
      data.append('file', selectedFile);
  
      // Optional: metadata and pinning options
      data.append('pinataMetadata', JSON.stringify({ name: selectedFile.name }));
      data.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));
  
      const res = await fetch(url, {
        method: 'POST',
        body: data,
        headers: {
          Authorization: `Bearer your-pinata-jwt-token, // Replace with your Pinata JWT token
`, 
        },
      });
  
      if (!res.ok) {
        throw new Error(`Pinata upload failed with status ${res.status}`);
      }
  
      const response = await res.json();
      console.log("Pinata upload response:", response);
  
      const ipfsHash = response.IpfsHash;
      if (!ipfsHash) throw new Error("No IPFS hash returned");
  
      setIpfsHash(ipfsHash);
    } catch (error) {
      console.error("File upload failed:", error);
    }
    await storeHashOnBlockchain(ipfsHash);
  };
  
  const storeHashOnBlockchain = async(hash) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum); //always remember this shit, whenever you need to connect to metamask, you need this
 
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress,contractAbi,signer);
    const tx = await contract.setIPFSHash(hash);  //tx = transaction object in ethers
    await tx.wait();
  }
 
const retrieveHash = async () => {
   const provider = new ethers.providers.Web3Provider(window.ethereum); //always remember this shit, whenever you need to connect to metamask, you need this
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress,contractAbi,signer);
    const storedHash = await contract.getIPFSHash();  //just going to read the stored hash
    setStoredHash(storedHash);

 }
  



  
  return (
    <div>
      <h1> IPFS Storage</h1>

      <div className='form'>
        <input type='file' onChange={changeHandler}/>
        <button onClick={handleSubmit}>Upload</button>

      </div>

      {ipfsHash && (
        <div>
          <p> IPFS Hash : {ipfsHash}</p>
          </div>
      )}

      <div>
        <button onClick={retrieveHash}>Retrieve Hash

        </button>
      </div>
      {storedHash && (
        <p>Stored Hash: {storedHash}</p>
      )}
      
    </div>
  )
}



export default App



// 0x0dda53d0d42c0082e329df082cec617d12cefc80

