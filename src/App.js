import React, { useEffect, useState } from "react";
import ERC20abi from "./contracts/Token.json";
import Web3 from "web3";
import Navbar from "./Navbar";
const MaticPOSClient = require("@maticnetwork/maticjs").MaticPOSClient;

const App = () => {
  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
    //esl
  }, []);
  let content;
  const [loading2, setloading2] = useState(false);

  const [GoerilDerc20address, setGoerilDerc20address] = useState("");
  const [MaticDerc20address, setMaticDerc20address] = useState("");

  const [Networkid, setNetworkid] = useState(0);
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [ERC20, setERC20] = useState({});
  const [MycontractAddress, setMycontractaddress] = useState("");
  const [inputvalue, setinputvalue] = useState("");

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

    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();

    setAccount(accounts[0]);
    const networkId = await web3.eth.net.getId();

    const goerilDerc20address = "0x655F2166b0709cd575202630952D71E2bB0d61Af"; // Derc 20 token addres deployed on  goeril
    const maticDerc20address = "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1"; // Derc20 token address deployed on matic
    setGoerilDerc20address(goerilDerc20address);
    setMaticDerc20address(maticDerc20address);
    setNetworkid(networkId);

    if (networkId == 5) {
      const erc20 = new web3.eth.Contract(ERC20abi.abi, goerilDerc20address);
      const name = await erc20.methods.balanceOf(accounts[0]).call();
      const balance = name / 1000000000000000000; // 18 decimals
      console.log(balance);
      seterc20balance(balance);

      setERC20(erc20);
      setLoading(false);
    } else if (networkId == 80001) {
      const erc20 = new web3.eth.Contract(ERC20abi.abi, maticDerc20address);
      const name = await erc20.methods.balanceOf(accounts[0]).call();
      const balance = name / 1000000000000000000; // 18 decimals
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
      posRootChainManager: "0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74",
      posERC20Predicate: "0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34",
      parentDefaultOptions: { from: account },
      maticDefaultOptions: { from: account },
    });
    return maticPOSClient;
  };

  const Approve = async () => {
    const maticPOSClient = posclient();
    const x = inputvalue * 1000000000000000000; // 18 decimals
    const x1 = x.toString();
    await maticPOSClient.approveERC20ForDeposit(GoerilDerc20address, x1, {
      from: account,
    });
  };

  const Deposit = async () => {
    const maticPOSClient = posclient();

    const x = inputvalue * 1000000000000000000; // 18 decimals
    const x1 = x.toString();

    await maticPOSClient.depositERC20ForUser(GoerilDerc20address, account, x1, {
      from: account,
    });
  };

  const burn = async () => {
    const maticPOSClient = posclient();
    const x = inputvalue * 1000000000000000000;
    const x1 = x.toString();
    const a = await maticPOSClient.burnERC20(MaticDerc20address, x1, {
      from: account,
    });
    setinputvalue(a.tx);
  };

  const exit = async () => {
    const maticPOSClient = posclient();
    // console.log(inputvalue);
    await maticPOSClient.exitERC20(inputvalue, {
      from: account,
    });
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
          // disabled={Networkid != 0 && Networkid == 5 ? false : true}
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
