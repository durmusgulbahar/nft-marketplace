import { create } from 'ipfs-http-client'
import { useState } from 'react';
import { Buffer } from "buffer";
import Web3Modal from 'web3modal'
import { ethers } from "ethers"
import { useRouter } from 'next/router'

// connect to ipfs daemon API server
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

const INFURA_PROJECT_ID = "2Jj1KTbwwajeWGWACrpdmRlfrzy"
const INFURA_API_KEY = "26d6aeb1dd16c1dad758d4d7a6f245fa"
const marketplaceAddress = "0xfec75a4975861DF0A611d47CfBF81610Ea39D0B4";
const projectId = INFURA_PROJECT_ID;
const projectSecret = INFURA_API_KEY;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  apiPath: '/api/v0',
  headers: {
    authorization: auth,
  }
})

function App() {
  const router = useRouter();
  const [fileUrl, updateFileUrl] = useState("");
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(file)
      const url = `https://nftmarket2.infura-ipfs.io/ipfs/${added.path}`
      updateFileUrl(url)

      console.log(fileUrl);
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function uploadToIPFS() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://nftmarket2.infura-ipfs.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

    

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* next, create the item */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    console.log(contract.address)
    let listingPrice = await contract.getListingPrice(); // listing price alamıyor contrattan
    listingPrice = listingPrice.toString()
    console.log("after price ")
    let transaction = await contract.createToken(url, price, { value: listingPrice })
    await transaction.wait()
    console.log(transaction);
    router.push('/')

  }
  
  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input 
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Create NFT
        </button>
      </div>
    </div>
  )
}

export default App;
