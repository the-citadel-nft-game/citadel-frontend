import type {NextPage} from 'next'
import Head from 'next/head'
import Image from 'next/image'
import WalletConnectProvider from '@walletconnect/web3-provider'
import styles from '../styles/Home.module.css'
import {ethers, providers} from 'ethers';
import Web3Modal from 'web3modal';
import {useCallback, useEffect, useReducer} from 'react';

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: {
                56: 'https://bsc-dataseed.binance.org/'
            },
            network: 'binance',
        }
    }
}

let web3Modal: any;
if (typeof window !== 'undefined') {
    web3Modal = new Web3Modal({
        network: 'binance', // optional
        cacheProvider: true,
        providerOptions, // required
    })
}

type StateType = {
    provider?: any
    web3Provider?: any
    address?: string
    chainId?: number
}

type ActionType =
    | {
    type: 'SET_WEB3_PROVIDER'
    provider?: StateType['provider']
    web3Provider?: StateType['web3Provider']
    address?: StateType['address']
    chainId?: StateType['chainId']
}
    | {
    type: 'SET_ADDRESS'
    address?: StateType['address']
}
    | {
    type: 'SET_CHAIN_ID'
    chainId?: StateType['chainId']
}
    | {
    type: 'RESET_WEB3_PROVIDER'
}

const initialState: StateType = {
    provider: null,
    web3Provider: null,
    address: '',
    chainId: 0,
}

function reducer(state: StateType, action: ActionType): StateType {
    switch (action.type) {
        case 'SET_WEB3_PROVIDER':
            return {
                ...state,
                provider: action.provider,
                web3Provider: action.web3Provider,
                address: action.address,
                chainId: action.chainId,
            }
        case 'SET_ADDRESS':
            return {
                ...state,
                address: action.address,
            }
        case 'SET_CHAIN_ID':
            return {
                ...state,
                chainId: action.chainId,
            }
        case 'RESET_WEB3_PROVIDER':
            return initialState
        default:
            throw new Error()
    }
}

const Home: NextPage = () => {
    const [state, dispatch] = useReducer(reducer, initialState)
    const { provider, web3Provider, address, chainId } = state


    const connect = useCallback(async function () {
        // This is the initial `provider` that is returned when
        // using web3Modal to connect. Can be MetaMask or WalletConnect.
        const provider = await web3Modal.connect()

        // We plug the initial `provider` into ethers.js and get back
        // a Web3Provider. This will add on methods from ethers.js and
        // event listeners such as `.on()` will be different.
        const web3Provider = new providers.Web3Provider(provider)

        const signer = web3Provider.getSigner()
        const address = await signer.getAddress()

        const network = await web3Provider.getNetwork()

        dispatch({
            type: 'SET_WEB3_PROVIDER',
            provider,
            web3Provider,
            address,
            chainId: network.chainId,
        })
    }, [])

  const disconnect = useCallback(
      async function () {
        await web3Modal.clearCachedProvider()
        if (provider?.disconnect && typeof provider.disconnect === 'function') {
          await provider.disconnect()
        }
        dispatch({
          type: 'RESET_WEB3_PROVIDER',
        })
      },
      [provider]
  )

    useEffect(() => {
        if (web3Modal.cachedProvider) {
            connect()
        }
    }, [connect])

    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="The Citadel"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    {web3Provider ? (
                        <button className="button" type="button" onClick={disconnect}>
                            Disconnect
                        </button>
                    ) : (
                        <button className="button" type="button" onClick={connect}>
                            Connect
                        </button>
                    )}
                </h1>
            </main>

            <footer className={styles.footer}>
                <a
                    href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{' '}
                    <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16}/>
          </span>
                </a>
            </footer>
        </div>
    )
}

export default Home
