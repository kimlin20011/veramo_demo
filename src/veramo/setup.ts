// Core interfaces
import { createAgent, IDIDManager, IResolver, IDataStore, IKeyManager } from '@veramo/core'

// Core identity manager plugin
import { DIDManager } from '@veramo/did-manager'

// Ethr did identity provider
import { EthrDIDProvider } from '@veramo/did-provider-ethr'

// Web did identity provider
import { WebDIDProvider } from '@veramo/did-provider-web'

// Core key manager plugin
import { KeyManager } from '@veramo/key-manager'

// Custom key management system for RN
import { KeyManagementSystem } from '@veramo/kms-local'

// Custom resolvers
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'

// Storage plugin using TypeOrm
import {
    Entities, KeyStore, DIDStore, IDataStoreORM, DataStore,
    DataStoreORM,
} from '@veramo/data-store'

// TypeORM is installed with `@veramo/data-store`
import { createConnection } from 'typeorm'

import { CredentialIssuer, W3cMessageHandler } from '@veramo/credential-w3c';

import { MessageHandler } from '@veramo/message-handler';
import { DIDComm, DIDCommMessageHandler } from '@veramo/did-comm';
import { JwtMessageHandler } from '@veramo/did-jwt';
import {
    SdrMessageHandler,
    SelectiveDisclosure,
} from '@veramo/selective-disclosure';



// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = 'database.sqlite'

// You will need to get a project ID from infura https://www.infura.io
const INFURA_PROJECT_ID = 'ae75828844224cbe94cb166ac19c764a' //dec_reference

const dbConnection = createConnection({
    type: 'sqlite',
    database: DATABASE_FILE,
    synchronize: true,
    logging: ['error', 'info', 'warn'],
    entities: Entities,
})

export const agent = createAgent<IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver>({
    plugins: [
        new KeyManager({
            store: new KeyStore(dbConnection),
            kms: {
                local: new KeyManagementSystem(),
            },
        }),
        new DIDManager({
            store: new DIDStore(dbConnection),
            defaultProvider: 'did:ethr:rinkeby',
            providers: {
                'did:ethr:rinkeby': new EthrDIDProvider({
                    defaultKms: 'local',
                    network: 'rinkeby',
                    rpcUrl: 'https://rinkeby.infura.io/v3/' + INFURA_PROJECT_ID,
                }),
                'did:web': new WebDIDProvider({
                    defaultKms: 'local',
                }),
            },
        }),
        new DIDResolverPlugin({
            resolver: new Resolver({
                ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
                ...webDidResolver(),
            }),
        }),
        new CredentialIssuer(),
        new DataStore(dbConnection as any),
        new DataStoreORM(dbConnection as any),
        new DIDComm(),
        new SelectiveDisclosure(),
    ],
})