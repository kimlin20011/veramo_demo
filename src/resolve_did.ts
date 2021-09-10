import { agent } from './veramo/setup'

var didUrl = "did:ethr:rinkeby:0x029cc4a99f4941bd68879087fb503d7279b361f44df983d5662ce07e70bdfc4ba7"

async function main() {
    const didDoc: any = await agent.resolveDid({
        //didUrl: `did:web:${username}`,
        didUrl: didUrl,
    });
    console.log(`Resolved didDoc`)
    console.log(didDoc)
}
main().catch(console.log)