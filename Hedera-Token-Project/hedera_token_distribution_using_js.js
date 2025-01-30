const {
    Client,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenMintTransaction,
    TokenAssociateTransaction,
    TransferTransaction,
    AccountId,
    AccountCreateTransaction,
    PrivateKey,
    Hbar,
} = require("@hashgraph/sdk");
require("dotenv").config();


const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);


const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function main() {
    try {

        const tokenCreateTx = new TokenCreateTransaction()
            .setTokenName("MANIKANTA_PUPPALA")
            .setTokenSymbol("MANI")
            .setDecimals(2)
            .setInitialSupply(0)
            .setTreasuryAccountId(operatorId)
            .setAdminKey(operatorKey)
            .setSupplyKey(operatorKey)
            .setTokenType(TokenType.FungibleCommon)
            .setSupplyType(TokenSupplyType.Infinite)
            .freezeWith(client);

        const tokenCreateSign = await tokenCreateTx.sign(operatorKey);
        const tokenCreateSubmit = await tokenCreateSign.execute(client);
        const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
        const tokenId = tokenCreateReceipt.tokenId;

        console.log(`Token created with ID: ${tokenId}`);


        const mintAmount = 2000;
        const mintTx = new TokenMintTransaction()
            .setTokenId(tokenId)
            .setAmount(mintAmount)
            .freezeWith(client);

        const mintSign = await mintTx.sign(operatorKey);
        const mintSubmit = await mintSign.execute(client);
        const mintReceipt = await mintSubmit.getReceipt(client);

        console.log(`Minted ${mintAmount} tokens. Status: ${mintReceipt.status}`);


        const accounts = [];
        for (let i = 0; i < 3; i++) {

            const accountPrivateKey = PrivateKey.generate();
            const accountPublicKey = accountPrivateKey.publicKey;


            const accountCreateTx = await new AccountCreateTransaction()
                .setKey(accountPublicKey)
                .setInitialBalance(new Hbar(10))
                .execute(client);

            const accountCreateReceipt = await accountCreateTx.getReceipt(client);
            const accountId = accountCreateReceipt.accountId;

            console.log(`Account ${i + 1} created with ID: ${accountId}`);


            const associateTx = await new TokenAssociateTransaction()
                .setAccountId(accountId)
                .setTokenIds([tokenId])
                .freezeWith(client)
                .sign(accountPrivateKey);

            const associateSubmit = await associateTx.execute(client);
            const associateReceipt = await associateSubmit.getReceipt(client);

            console.log(`Account ${accountId} associated with token. Status: ${associateReceipt.status}`);

            accounts.push({ id: accountId, key: accountPrivateKey });
        }


        const distributeAmount = 500;
        const transferTx = new TransferTransaction();
        for (const account of accounts) {
            transferTx.addTokenTransfer(tokenId, operatorId, -distributeAmount);
            transferTx.addTokenTransfer(tokenId, account.id, distributeAmount);
        }

        const transferSign = await transferTx.freezeWith(client).sign(operatorKey);
        const transferSubmit = await transferSign.execute(client);
        const transferReceipt = await transferSubmit.getReceipt(client);

        console.log(`Distributed ${distributeAmount} tokens to each account. Status: ${transferReceipt.status}`);


        console.log("Final token distribution:");
        for (const account of accounts) {
            console.log(`- Account ${account.id.toString()} received ${distributeAmount} tokens`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

main();

//referred workshop of hedera by IDS