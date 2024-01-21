
/*
  // Web3 Action calls
  const Subscribe = async () => {
    let alertMessage = "Successfully Subscribed Validators"
    let userRejected = false;
    setHash(true);
    try {
      // Write 
      const [address] = await walletClient.getAddresses();
      const { request } = await client.simulateContract({
        address: NETWORK.poolAddress,
        abi: NETWORK.poolAbi,
        functionName: 'registerBulk',
        account: address, 
        args: [selectedS],
        value: NETWORK.stakeFee * BigInt(selectedS.length),
      });

      // Wait
      const hash = await walletClient.writeContract(request);
      const reciept = await client.waitForTransactionReceipt({ hash });
    } catch(err: any) {
      if(err.message.includes('User rejected the request')) {
        userRejected = true;
      }
      if (err instanceof BaseError) {
        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? ''
          if(errorName == 'NotEnoughEth') {
            alertMessage = 'Error: Not Enough Eth send';
          } else {
            alertMessage = `Error: ${errorName}`
          }
        }
      } 
    } finally {
      setHash(false);
      if(!userRejected) {
        setSelectedS([]);
        setAlert(alertMessage); 
      }
    }
  }

  const Claim = async () => {
    if(withdrawals.proof.length == 0) { return 0; }
    let alertMessage = "Successfully Claimed Rewards"
    let userRejected = false;
    setHash(true);
    try {
      const [address] = await walletClient.getAddresses();
      const { request } = await client.simulateContract({
        address: NETWORK.poolAddress,
        abi: NETWORK.poolAbi,
        functionName: 'withdrawRewards',
        account: address, 
        args: [
          withdrawals.proof[0], 
          withdrawals.proof[1], 
          withdrawals.proof[2].hex
        ]
      });

      // Write 
      const hash = await walletClient.writeContract(request);
      const reciept = await client.waitForTransactionReceipt({ hash });
    } catch(err: any) {
      if(err.message.includes('User rejected the request')) {
        userRejected = true;
      }
      if (err instanceof BaseError) {
        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? ''
          if(errorName == 'AlreadyClaimed') {
            alertMessage = 'Error: Rewards already claimed';
          } else if(errorName == 'InvalidProof') {
            alertMessage = 'Error: Invalid Proof';
          } else {
            alertMessage = `Error: ${errorName}`
          }
        }
      }    
    } finally {
      // Update state
      setHash(false);
      if(!userRejected) {
        setAlert(alertMessage); 
      }
    }
  }

  const RequestExit = async () => {
    let alertMessage = 'Successfully Requested Exit';
    let userRejected = false;
    setHash(true);
    try {
      // Write 
      const [address] = await walletClient.getAddresses();
      const { request } = await client.simulateContract({
        address: NETWORK.poolAddress,
        abi: NETWORK.poolAbi,
        functionName: 'requestExit',
        account: address, 
        args: [selectedE]
      });

      // Write 
      const hash = await walletClient.writeContract(request);
      const reciept = await client.waitForTransactionReceipt({ hash });
    } catch(err: any) {
      if(err.message.includes('User rejected the request')) {
        userRejected = true;
      }
      if (err instanceof BaseError) {
        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? ''
          alertMessage = `Error: ${errorName}`
        }
      } 
    } finally {
      // Reset
      setHash(false);
      if(!userRejected) {
        setSelectedE([]);
        setAlert(alertMessage);
      }
    }
  }

  const WithdrawBond = async () => {
    if(exits.proof.length == 0) { return 0; }
    let alertMessage = 'Successfully Withdrawn Bond';
    let userRejected = false;
    setHash(true);
    try {
      // Write 
      const [address] = await walletClient.getAddresses();
      const { request } = await client.simulateContract({
        address: NETWORK.poolAddress,
        abi: NETWORK.poolAbi,
        functionName: 'withdrawStake',
        account: address, 
        args: [
          exits.proof[0], 
          exits.proof[1], 
          exits.proof[2].hex
        ]
      });

      // Wait
      const hash = await walletClient.writeContract(request);
      const reciept = await client.waitForTransactionReceipt({ hash });
    } catch(err: any) {
      if (err instanceof BaseError) {
        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? ''
          if(errorName == 'AlreadyClaimed') {
            alertMessage = 'Error: Bond already claimed';
          } else if(errorName == 'InvalidProof') {
            alertMessage = 'Error: Invalid Proof';
          } else {
            alertMessage = `Error: ${errorName}`
          }
        }
      } else if(err.message.includes('User rejected the request')) {
        userRejected = true;
      }
    } finally {
      setHash(false);
      if(userRejected) {
        setAlert(alertMessage);
      }
    }
    /*
      const req = await fetch('/withdrawBond', { method: 'POST' });
      const res = await req.json();
      if(res.ok) {
        setValidators(res.data);
        setWithdrawals({ proof: [] });
      }

      // Reset
      setHash(false);
      setAlert("Successfully Witdhraw Bonds");
    } catch(err: any) {
      setHash(false);
      if(!err.message.includes('User rejected the request')) {
        setAlert("Error: transaction reverted");
      }
      console.log(err)
    }*/
  }
  const AddBond = async (index) => {
    let alertMessage = 'Successfully Added Bond';
    let userRejected = false;
    setHash(true);
    try {
      // Write 
      const [address] = await walletClient.getAddresses();
      const { request } = await client.simulateContract({
        address: NETWORK.poolAddress,
        abi: NETWORK.poolAbi,
        functionName: 'addStake',
        account: address, 
        args: [index],
        value: NETWORK.missFee,
      });

      // Wait
      const hash = await walletClient.writeContract(request);
      const reciept = await client.waitForTransactionReceipt({ hash });
    } catch(err: any) {
      if (err instanceof BaseError) {
        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? ''
          if(errorName == 'ZeroAmount') {
            alertMessage = "Error: Eth amount can't be 0";
          } else if(errorName == 'AmountTooBig') {
            alertMessage = 'Error: Amount to add is too big';
          } else {
            alertMessage = `Error: ${errorName}`
          }
        }
      } else if(!err.message.includes('User rejected the request')) {
        userRejected = true;
      }
    } finally {
      setHash(false);
      if(userRejected) {
        setAlert(alertMessage);
      }
    }
    /*
      const verifyRes = await fetch('/addbond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: index }),
      });

      // Reset
      setHash(false);
      setAlert("Successfully Added Bond");
    } catch(err: any) {
      setHash(false);
      if(!err.message.includes('User rejected the request')) {
        setAlert("Error: transaction reverted");
      }
      console.log(err)
    }*/
  }
  */
