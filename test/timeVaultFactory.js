var TestToken = artifacts.require("TestToken");
var TimeVaultFactory = artifacts.require("TimeVaultFactory");
var TimeVault = artifacts.require("TimeVault");

contract("TimeVaultFactory", async (accounts) => {
    const REVERT_ERROR = 'VM Exception while processing transaction: revert';

    let testTokenWeb3Contract;
    let now = Math.round(new Date().getTime() / 1000);

    beforeEach('Init', async () => {
        testTokenWeb3Contract = await web3.eth.contract(TestToken.abi).at(TestToken.address);
    });

    it('should create TimeVault contract with valid params', async () => {

        let rawData = await testTokenWeb3Contract["generate"].getData(123);

        let timeVaultFactoryContract = await TimeVaultFactory.deployed();
        let tx = await timeVaultFactoryContract.create(TestToken.address, 0, rawData, now);

        const timeVaultContractAddress = tx.receipt.logs[0].address;
        let timeVaultContract = await TimeVault.at(timeVaultContractAddress);
        const scheduledTransactionData = await timeVaultContract.transaction.call();
        const timeVaultOwner = await timeVaultContract.owner.call();

        assert.equal(timeVaultOwner, accounts[0]);
        assert.equal(scheduledTransactionData[0], TestToken.address); // destination
        assert.equal(scheduledTransactionData[1].toString(), 0); // value
        assert.equal(scheduledTransactionData[2], rawData); // data to execute
        assert.equal(scheduledTransactionData[3], false); // isExecuted
        assert.equal(scheduledTransactionData[4].toString(), now); // blockedUntil
    });

    it('should execute after blocked time and ends up with success', async () => {
        const transferTo = accounts[1];
        const transferValue = 123;
        let rawData = await testTokenWeb3Contract["transfer"].getData(transferTo, transferValue);

        let timeVaultFactoryContract = await TimeVaultFactory.deployed();
        let blockedUntil = now - (60 * 60);
        let tx = await timeVaultFactoryContract.create(TestToken.address, 0, rawData, blockedUntil);

        const timeVaultContractAddress = tx.receipt.logs[0].address;
        let timeVaultContract = await TimeVault.at(timeVaultContractAddress);

        const data = await timeVaultContract.execute();
        let testToken = await TestToken.deployed();
        const transferedValue = await testToken.balanceOf.call(transferTo);

        assert.equal(transferedValue, transferValue);
    });

    it('should execute before blocked time and ends up with revert', async () => {
        const transferTo = accounts[1];
        const transferValue = 123;
        let rawData = await testTokenWeb3Contract["transfer"].getData(transferTo, transferValue);

        let timeVaultFactoryContract = await TimeVaultFactory.deployed();
        let blockedUntil = now + (60 * 60);
        let tx = await timeVaultFactoryContract.create(TestToken.address, 0, rawData, blockedUntil);

        const timeVaultContractAddress = tx.receipt.logs[0].address;
        let timeVaultContract = await TimeVault.at(timeVaultContractAddress);

        try {
            const data = await timeVaultContract.execute();
            throw null;
        } catch (error) {
            assert(error, "Expected an error but did not get one");
            assert.equal(error.message, REVERT_ERROR);
        }
    });
});