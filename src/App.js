import React, { useEffect, useState } from "react";
import ERC20abi from "./contracts/Token.json";
import Web3 from "web3";
import Navbar from "./Navbar";
import WalletConnectProvider from "@maticnetwork/walletconnect-provider";
const MaticPOSClient = require("@maticnetwork/maticjs").MaticPOSClient;

const App = () => {
  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
    //esl
  }, []);
  let content;
  const [loading2, setloading2] = useState(false);

  const [Networkid, setNetworkid] = useState(0);
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [ERC20, setERC20] = useState({});
  const [Maticweb3, setMaticweb3] = useState();
  const [Goerillweb3, setGoerillweb3] = useState();
  const [MycontractAddress, setMycontractaddress] = useState("");
  const [inputvalue, setinputvalue] = useState("");

  const [maticSdk, setmaticSdk] = useState();
  const [maticprovider, setMaticprovider] = useState();
  const [goerilprovider, setgoerilprovider] = useState();
  const [erc20balance, seterc20balance] = useState("");
  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  const loadBlockchainData = async () => {
    setLoading(true);
    const maticProvider = new WalletConnectProvider({
      host: `https://rpc-mumbai.matic.today`,
      callbacks: {
        onConnect: console.log("matic connected"),
        onDisconnect: console.log("matic disconnected!"),
      },
    });

    const goerillProvider = new WalletConnectProvider({
      host: `https://goerli.infura.io/v3/541999c8adbc4c3594d03a6b7b71eda6`,
      callbacks: {
        onConnect: console.log("goeril connected"),
        onDisconnect: console.log("goeril disconnected"),
      },
    });

    setMaticprovider(maticProvider);
    setgoerilprovider(goerillProvider);

    const maticWeb3 = new Web3(maticProvider);
    setMaticweb3(maticWeb3);
    const goerilWeb3 = new Web3(goerillProvider);
    setGoerillweb3(goerilWeb3);
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();

    setAccount(accounts[0]);
    const networkId = await web3.eth.net.getId();

    const goerilContractaddress = "0x655F2166b0709cd575202630952D71E2bB0d61Af";
    const maticContractaddress = "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1";

    setNetworkid(networkId);
    if (networkId == 5) {
      const erc20 = new web3.eth.Contract(ERC20abi.abi, goerilContractaddress);
      const name = await erc20.methods.balanceOf(accounts[0]).call();
      const balance = name / 1000000000000000000;
      console.log(balance);
      seterc20balance(balance);

      setERC20(erc20);
      setLoading(false);
    } else if (networkId == 80001) {
      const erc20 = new web3.eth.Contract(ERC20abi.abi, maticContractaddress);
      const name = await erc20.methods.balanceOf(accounts[0]).call();
      const balance = name / 1000000000000000000;
      console.log(balance);
      seterc20balance(balance);
      setLoading(false);
    } else {
      window.alert(" contract not deployed to detected network.");
      setloading2(true);
    }
  };

  const posclient = () => {
    const maticPOSClient = new MaticPOSClient({
      network: "testnet",
      version: "mumbai",
      maticProvider: window.web3,
      parentProvider: window.web3,
      POSRootChainManager: "0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74",
      posERC20Predicate: "0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34",
      posERC721Predicate: "0x74D83801586E9D3C4dc45FfCD30B54eA9C88cf9b",
      posERC1155Predicate: "0xB19a86ba1b50f0A395BfdC3557608789ee184dC8",
      posEtherPredicate: "0xe2B01f3978c03D6DdA5aE36b2f3Ac0d66C54a6D5",
      parentDefaultOptions: { from: account },
      maticDefaultOptions: { from: account },
    });
    return maticPOSClient;
  };

  const Approve = async () => {
    const maticPOSClient = posclient();
    const x = inputvalue * 1000000000000000000;
    const x1 = x.toString();
    await maticPOSClient.approveERC20ForDeposit(
      "0x655F2166b0709cd575202630952D71E2bB0d61Af",
      x1,
      {
        from: account,
      }
    );
  };

  const Deposit = async () => {
    const maticPOSClient = posclient();

    const x = inputvalue * 1000000000000000000;
    const x1 = x.toString();

    await maticPOSClient.depositERC20ForUser(
      "0x655F2166b0709cd575202630952D71E2bB0d61Af",
      account,
      x1,
      {
        from: account,
      }
    );
  };

  const burn = async () => {
    const maticPOSClient = posclient();
    const x = inputvalue * 1000000000000000000;
    const x1 = x.toString();
    await maticPOSClient.burnERC20(
      "0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e",
      x1,
      {
        from: account,
      }
    );
  };

  const exit = async () => {
    const maticPOSClient = posclient();
    await maticPOSClient.exitERC20(
      "0xc52b529e37bd23fd6040db80cd4d48809e8846b4965abc492413908010733679",
      {
        from: account,
      }
    );
  };
  const onchange = (e) => {
    setinputvalue(e.target.value);
  };

  if (loading === true) {
    content = (
      <p className="text-center">
        Loading...{loading2 ? <div>load on mainenet </div> : ""}
      </p>
    );
  } else {
    content = (
      <div class="container">
        <h1>
          your ERC20 balance : <b>{erc20balance} </b>
        </h1>
        <button
          class="btn-primary"
          onClick={Approve}
          disabled={Networkid != 0 && Networkid == 80001 ? true : false}
        >
          Approve
        </button>

        <button
          class="btn-primary"
          onClick={Deposit}
          disabled={Networkid != 0 && Networkid == 80001 ? true : false}
        >
          Deposit
        </button>

        <button
          class="btn-primary"
          onClick={burn}
          disabled={Networkid != 0 && Networkid == 5 ? true : false}
        >
          burn
        </button>

        <button
          class="btn-primary"
          onClick={exit}
          disabled={Networkid != 0 && Networkid == 5 ? true : false}
        >
          exit
        </button>

        <br />
        <p></p>
        <input
          id="inputvalue"
          type="text"
          className="form-control"
          placeholder="value"
          name="inputvalue"
          value={inputvalue}
          onChange={onchange}
          required
        />
      </div>
    );
  }

  return (
    <div>
      <Navbar account={account} />
      {content}
    </div>
  );
};

export default App;
