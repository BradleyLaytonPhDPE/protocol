// tslint:disable:no-consecutive-blank-lines ordered-imports align trailing-comma enum-naming
// tslint:disable:whitespace no-unbound-method no-trailing-whitespace
// tslint:disable:no-unused-variable
import {
    AwaitTransactionSuccessOpts,
    EncoderOverrides,
    ContractFunctionObj,
    ContractTxFunctionObj,
    SendTransactionOpts,
    BaseContract,
    SubscriptionManager,
    PromiseWithTransactionHash,
    methodAbiToFunctionSignature,
    linkLibrariesInBytecode,
} from '@0x/base-contract';
import { schemas } from '@0x/json-schemas';
import {
    BlockParam,
    BlockParamLiteral,
    BlockRange,
    CallData,
    ContractAbi,
    ContractArtifact,
    DecodedLogArgs,
    LogWithDecodedArgs,
    MethodAbi,
    TransactionReceiptWithDecodedLogs,
    TxData,
    TxDataPayable,
    TxAccessListWithGas,
    SupportedProvider,
} from 'ethereum-types';
import { AbiEncoder, BigNumber, classUtils, EncodingRules, hexUtils, logUtils, providerUtils } from '@0x/utils';
import { EventCallback, IndexedFilterValues, SimpleContractArtifact } from '@0x/types';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { assert } from '@0x/assert';
import * as ethers from 'ethers';
// tslint:enable:no-unused-variable

export type IZeroExEventArgs =
    | IZeroExLimitOrderFilledEventArgs
    | IZeroExLiquidityProviderSwapEventArgs
    | IZeroExMetaTransactionExecutedEventArgs
    | IZeroExMigratedEventArgs
    | IZeroExOrderCancelledEventArgs
    | IZeroExOrderSignerRegisteredEventArgs
    | IZeroExOtcOrderFilledEventArgs
    | IZeroExOwnershipTransferredEventArgs
    | IZeroExPairCancelledLimitOrdersEventArgs
    | IZeroExPairCancelledRfqOrdersEventArgs
    | IZeroExProxyFunctionUpdatedEventArgs
    | IZeroExQuoteSignerUpdatedEventArgs
    | IZeroExRfqOrderFilledEventArgs
    | IZeroExRfqOrderOriginsAllowedEventArgs
    | IZeroExTransformedERC20EventArgs
    | IZeroExTransformerDeployerUpdatedEventArgs;

export enum IZeroExEvents {
    LimitOrderFilled = 'LimitOrderFilled',
    LiquidityProviderSwap = 'LiquidityProviderSwap',
    MetaTransactionExecuted = 'MetaTransactionExecuted',
    Migrated = 'Migrated',
    OrderCancelled = 'OrderCancelled',
    OrderSignerRegistered = 'OrderSignerRegistered',
    OtcOrderFilled = 'OtcOrderFilled',
    OwnershipTransferred = 'OwnershipTransferred',
    PairCancelledLimitOrders = 'PairCancelledLimitOrders',
    PairCancelledRfqOrders = 'PairCancelledRfqOrders',
    ProxyFunctionUpdated = 'ProxyFunctionUpdated',
    QuoteSignerUpdated = 'QuoteSignerUpdated',
    RfqOrderFilled = 'RfqOrderFilled',
    RfqOrderOriginsAllowed = 'RfqOrderOriginsAllowed',
    TransformedERC20 = 'TransformedERC20',
    TransformerDeployerUpdated = 'TransformerDeployerUpdated',
}

export interface IZeroExLimitOrderFilledEventArgs extends DecodedLogArgs {
    orderHash: string;
    maker: string;
    taker: string;
    feeRecipient: string;
    makerToken: string;
    takerToken: string;
    takerTokenFilledAmount: BigNumber;
    makerTokenFilledAmount: BigNumber;
    takerTokenFeeFilledAmount: BigNumber;
    protocolFeePaid: BigNumber;
    pool: string;
}

export interface IZeroExLiquidityProviderSwapEventArgs extends DecodedLogArgs {
    inputToken: string;
    outputToken: string;
    inputTokenAmount: BigNumber;
    outputTokenAmount: BigNumber;
    provider: string;
    recipient: string;
}

export interface IZeroExMetaTransactionExecutedEventArgs extends DecodedLogArgs {
    hash: string;
    selector: string;
    signer: string;
    sender: string;
}

export interface IZeroExMigratedEventArgs extends DecodedLogArgs {
    caller: string;
    migrator: string;
    newOwner: string;
}

export interface IZeroExOrderCancelledEventArgs extends DecodedLogArgs {
    orderHash: string;
    maker: string;
}

export interface IZeroExOrderSignerRegisteredEventArgs extends DecodedLogArgs {
    maker: string;
    signer: string;
    allowed: boolean;
}

export interface IZeroExOtcOrderFilledEventArgs extends DecodedLogArgs {
    orderHash: string;
    maker: string;
    taker: string;
    makerToken: string;
    takerToken: string;
    makerTokenFilledAmount: BigNumber;
    takerTokenFilledAmount: BigNumber;
}

export interface IZeroExOwnershipTransferredEventArgs extends DecodedLogArgs {
    previousOwner: string;
    newOwner: string;
}

export interface IZeroExPairCancelledLimitOrdersEventArgs extends DecodedLogArgs {
    maker: string;
    makerToken: string;
    takerToken: string;
    minValidSalt: BigNumber;
}

export interface IZeroExPairCancelledRfqOrdersEventArgs extends DecodedLogArgs {
    maker: string;
    makerToken: string;
    takerToken: string;
    minValidSalt: BigNumber;
}

export interface IZeroExProxyFunctionUpdatedEventArgs extends DecodedLogArgs {
    selector: string;
    oldImpl: string;
    newImpl: string;
}

export interface IZeroExQuoteSignerUpdatedEventArgs extends DecodedLogArgs {
    quoteSigner: string;
}

export interface IZeroExRfqOrderFilledEventArgs extends DecodedLogArgs {
    orderHash: string;
    maker: string;
    taker: string;
    makerToken: string;
    takerToken: string;
    takerTokenFilledAmount: BigNumber;
    makerTokenFilledAmount: BigNumber;
    pool: string;
}

export interface IZeroExRfqOrderOriginsAllowedEventArgs extends DecodedLogArgs {
    origin: string;
    addrs: string[];
    allowed: boolean;
}

export interface IZeroExTransformedERC20EventArgs extends DecodedLogArgs {
    taker: string;
    inputToken: string;
    outputToken: string;
    inputTokenAmount: BigNumber;
    outputTokenAmount: BigNumber;
}

export interface IZeroExTransformerDeployerUpdatedEventArgs extends DecodedLogArgs {
    transformerDeployer: string;
}

/* istanbul ignore next */
// tslint:disable:array-type
// tslint:disable:no-parameter-reassignment
// tslint:disable-next-line:class-name
export class IZeroExContract extends BaseContract {
    /**
     * @ignore
     */
    public static deployedBytecode: string | undefined;
    public static contractName = 'IZeroEx';
    private readonly _methodABIIndex: { [name: string]: number } = {};
    private readonly _subscriptionManager: SubscriptionManager<IZeroExEventArgs, IZeroExEvents>;
    public static async deployFrom0xArtifactAsync(
        artifact: ContractArtifact | SimpleContractArtifact,
        supportedProvider: SupportedProvider,
        txDefaults: Partial<TxData>,
        logDecodeDependencies: { [contractName: string]: ContractArtifact | SimpleContractArtifact },
    ): Promise<IZeroExContract> {
        assert.doesConformToSchema('txDefaults', txDefaults, schemas.txDataSchema);
        if (artifact.compilerOutput === undefined) {
            throw new Error('Compiler output not found in the artifact file');
        }
        const provider = providerUtils.standardizeOrThrow(supportedProvider);
        const bytecode = artifact.compilerOutput.evm.bytecode.object;
        const abi = artifact.compilerOutput.abi;
        const logDecodeDependenciesAbiOnly: { [contractName: string]: ContractAbi } = {};
        if (Object.keys(logDecodeDependencies) !== undefined) {
            for (const key of Object.keys(logDecodeDependencies)) {
                logDecodeDependenciesAbiOnly[key] = logDecodeDependencies[key].compilerOutput.abi;
            }
        }
        return IZeroExContract.deployAsync(bytecode, abi, provider, txDefaults, logDecodeDependenciesAbiOnly);
    }

    public static async deployWithLibrariesFrom0xArtifactAsync(
        artifact: ContractArtifact,
        libraryArtifacts: { [libraryName: string]: ContractArtifact },
        supportedProvider: SupportedProvider,
        txDefaults: Partial<TxData>,
        logDecodeDependencies: { [contractName: string]: ContractArtifact | SimpleContractArtifact },
    ): Promise<IZeroExContract> {
        assert.doesConformToSchema('txDefaults', txDefaults, schemas.txDataSchema);
        if (artifact.compilerOutput === undefined) {
            throw new Error('Compiler output not found in the artifact file');
        }
        const provider = providerUtils.standardizeOrThrow(supportedProvider);
        const abi = artifact.compilerOutput.abi;
        const logDecodeDependenciesAbiOnly: { [contractName: string]: ContractAbi } = {};
        if (Object.keys(logDecodeDependencies) !== undefined) {
            for (const key of Object.keys(logDecodeDependencies)) {
                logDecodeDependenciesAbiOnly[key] = logDecodeDependencies[key].compilerOutput.abi;
            }
        }
        const libraryAddresses = await IZeroExContract._deployLibrariesAsync(
            artifact,
            libraryArtifacts,
            new Web3Wrapper(provider),
            txDefaults,
        );
        const bytecode = linkLibrariesInBytecode(artifact, libraryAddresses);
        return IZeroExContract.deployAsync(bytecode, abi, provider, txDefaults, logDecodeDependenciesAbiOnly);
    }

    public static async deployAsync(
        bytecode: string,
        abi: ContractAbi,
        supportedProvider: SupportedProvider,
        txDefaults: Partial<TxData>,
        logDecodeDependencies: { [contractName: string]: ContractAbi },
    ): Promise<IZeroExContract> {
        assert.isHexString('bytecode', bytecode);
        assert.doesConformToSchema('txDefaults', txDefaults, schemas.txDataSchema);
        const provider = providerUtils.standardizeOrThrow(supportedProvider);
        const constructorAbi = BaseContract._lookupConstructorAbi(abi);
        [] = BaseContract._formatABIDataItemList(constructorAbi.inputs, [], BaseContract._bigNumberToString);
        const iface = new ethers.utils.Interface(abi);
        const deployInfo = iface.deployFunction;
        const txData = deployInfo.encode(bytecode, []);
        const web3Wrapper = new Web3Wrapper(provider);
        const txDataWithDefaults = await BaseContract._applyDefaultsToContractTxDataAsync(
            {
                data: txData,
                ...txDefaults,
            },
            web3Wrapper.estimateGasAsync.bind(web3Wrapper),
        );
        const txHash = await web3Wrapper.sendTransactionAsync(txDataWithDefaults);
        logUtils.log(`transactionHash: ${txHash}`);
        const txReceipt = await web3Wrapper.awaitTransactionSuccessAsync(txHash);
        logUtils.log(`IZeroEx successfully deployed at ${txReceipt.contractAddress}`);
        const contractInstance = new IZeroExContract(
            txReceipt.contractAddress as string,
            provider,
            txDefaults,
            logDecodeDependencies,
        );
        contractInstance.constructorArgs = [];
        return contractInstance;
    }

    /**
     * @returns      The contract ABI
     */
    public static ABI(): ContractAbi {
        const abi = [
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'orderHash',
                        type: 'bytes32',
                        indexed: false,
                    },
                    {
                        name: 'maker',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'taker',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'feeRecipient',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'makerToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'takerToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'takerTokenFilledAmount',
                        type: 'uint128',
                        indexed: false,
                    },
                    {
                        name: 'makerTokenFilledAmount',
                        type: 'uint128',
                        indexed: false,
                    },
                    {
                        name: 'takerTokenFeeFilledAmount',
                        type: 'uint128',
                        indexed: false,
                    },
                    {
                        name: 'protocolFeePaid',
                        type: 'uint256',
                        indexed: false,
                    },
                    {
                        name: 'pool',
                        type: 'bytes32',
                        indexed: false,
                    },
                ],
                name: 'LimitOrderFilled',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'inputToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'outputToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'inputTokenAmount',
                        type: 'uint256',
                        indexed: false,
                    },
                    {
                        name: 'outputTokenAmount',
                        type: 'uint256',
                        indexed: false,
                    },
                    {
                        name: 'provider',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'recipient',
                        type: 'address',
                        indexed: false,
                    },
                ],
                name: 'LiquidityProviderSwap',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'hash',
                        type: 'bytes32',
                        indexed: false,
                    },
                    {
                        name: 'selector',
                        type: 'bytes4',
                        indexed: true,
                    },
                    {
                        name: 'signer',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'sender',
                        type: 'address',
                        indexed: false,
                    },
                ],
                name: 'MetaTransactionExecuted',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'caller',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'migrator',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'newOwner',
                        type: 'address',
                        indexed: false,
                    },
                ],
                name: 'Migrated',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'orderHash',
                        type: 'bytes32',
                        indexed: false,
                    },
                    {
                        name: 'maker',
                        type: 'address',
                        indexed: false,
                    },
                ],
                name: 'OrderCancelled',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'maker',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'signer',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'allowed',
                        type: 'bool',
                        indexed: false,
                    },
                ],
                name: 'OrderSignerRegistered',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'orderHash',
                        type: 'bytes32',
                        indexed: false,
                    },
                    {
                        name: 'maker',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'taker',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'makerToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'takerToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'makerTokenFilledAmount',
                        type: 'uint128',
                        indexed: false,
                    },
                    {
                        name: 'takerTokenFilledAmount',
                        type: 'uint128',
                        indexed: false,
                    },
                ],
                name: 'OtcOrderFilled',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'previousOwner',
                        type: 'address',
                        indexed: true,
                    },
                    {
                        name: 'newOwner',
                        type: 'address',
                        indexed: true,
                    },
                ],
                name: 'OwnershipTransferred',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'maker',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'makerToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'takerToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'minValidSalt',
                        type: 'uint256',
                        indexed: false,
                    },
                ],
                name: 'PairCancelledLimitOrders',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'maker',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'makerToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'takerToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'minValidSalt',
                        type: 'uint256',
                        indexed: false,
                    },
                ],
                name: 'PairCancelledRfqOrders',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'selector',
                        type: 'bytes4',
                        indexed: true,
                    },
                    {
                        name: 'oldImpl',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'newImpl',
                        type: 'address',
                        indexed: false,
                    },
                ],
                name: 'ProxyFunctionUpdated',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'quoteSigner',
                        type: 'address',
                        indexed: false,
                    },
                ],
                name: 'QuoteSignerUpdated',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'orderHash',
                        type: 'bytes32',
                        indexed: false,
                    },
                    {
                        name: 'maker',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'taker',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'makerToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'takerToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'takerTokenFilledAmount',
                        type: 'uint128',
                        indexed: false,
                    },
                    {
                        name: 'makerTokenFilledAmount',
                        type: 'uint128',
                        indexed: false,
                    },
                    {
                        name: 'pool',
                        type: 'bytes32',
                        indexed: false,
                    },
                ],
                name: 'RfqOrderFilled',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'origin',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'addrs',
                        type: 'address[]',
                        indexed: false,
                    },
                    {
                        name: 'allowed',
                        type: 'bool',
                        indexed: false,
                    },
                ],
                name: 'RfqOrderOriginsAllowed',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'taker',
                        type: 'address',
                        indexed: true,
                    },
                    {
                        name: 'inputToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'outputToken',
                        type: 'address',
                        indexed: false,
                    },
                    {
                        name: 'inputTokenAmount',
                        type: 'uint256',
                        indexed: false,
                    },
                    {
                        name: 'outputTokenAmount',
                        type: 'uint256',
                        indexed: false,
                    },
                ],
                name: 'TransformedERC20',
                outputs: [],
                type: 'event',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        name: 'transformerDeployer',
                        type: 'address',
                        indexed: false,
                    },
                ],
                name: 'TransformerDeployerUpdated',
                outputs: [],
                type: 'event',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerTokenFeeAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipient',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerTokenFillAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'taker',
                        type: 'address',
                    },
                    {
                        name: 'sender',
                        type: 'address',
                    },
                ],
                name: '_fillLimitOrder',
                outputs: [
                    {
                        name: 'takerTokenFilledAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'makerTokenFilledAmount',
                        type: 'uint128',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'expiryAndNonce',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'makerSignature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerTokenFillAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'taker',
                        type: 'address',
                    },
                    {
                        name: 'useSelfBalance',
                        type: 'bool',
                    },
                    {
                        name: 'recipient',
                        type: 'address',
                    },
                ],
                name: '_fillOtcOrder',
                outputs: [
                    {
                        name: 'takerTokenFilledAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'makerTokenFilledAmount',
                        type: 'uint128',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerTokenFillAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'taker',
                        type: 'address',
                    },
                    {
                        name: 'useSelfBalance',
                        type: 'bool',
                    },
                    {
                        name: 'recipient',
                        type: 'address',
                    },
                ],
                name: '_fillRfqOrder',
                outputs: [
                    {
                        name: 'takerTokenFilledAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'makerTokenFilledAmount',
                        type: 'uint128',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'encodedPath',
                        type: 'bytes',
                    },
                    {
                        name: 'sellAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'minBuyAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'recipient',
                        type: 'address',
                    },
                ],
                name: '_sellHeldTokenForTokenToUniswapV3',
                outputs: [
                    {
                        name: 'buyAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'args',
                        type: 'tuple',
                        components: [
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'inputToken',
                                type: 'address',
                            },
                            {
                                name: 'outputToken',
                                type: 'address',
                            },
                            {
                                name: 'inputTokenAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'minOutputTokenAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'transformations',
                                type: 'tuple[]',
                                components: [
                                    {
                                        name: 'deploymentNonce',
                                        type: 'uint32',
                                    },
                                    {
                                        name: 'data',
                                        type: 'bytes',
                                    },
                                ],
                            },
                            {
                                name: 'useSelfBalance',
                                type: 'bool',
                            },
                            {
                                name: 'recipient',
                                type: 'address',
                            },
                        ],
                    },
                ],
                name: '_transformERC20',
                outputs: [
                    {
                        name: 'outputTokenAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'orders',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerTokenFeeAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipient',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                ],
                name: 'batchCancelLimitOrders',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'makerTokens',
                        type: 'address[]',
                    },
                    {
                        name: 'takerTokens',
                        type: 'address[]',
                    },
                    {
                        name: 'minValidSalts',
                        type: 'uint256[]',
                    },
                ],
                name: 'batchCancelPairLimitOrders',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'maker',
                        type: 'address',
                    },
                    {
                        name: 'makerTokens',
                        type: 'address[]',
                    },
                    {
                        name: 'takerTokens',
                        type: 'address[]',
                    },
                    {
                        name: 'minValidSalts',
                        type: 'uint256[]',
                    },
                ],
                name: 'batchCancelPairLimitOrdersWithSigner',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'makerTokens',
                        type: 'address[]',
                    },
                    {
                        name: 'takerTokens',
                        type: 'address[]',
                    },
                    {
                        name: 'minValidSalts',
                        type: 'uint256[]',
                    },
                ],
                name: 'batchCancelPairRfqOrders',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'maker',
                        type: 'address',
                    },
                    {
                        name: 'makerTokens',
                        type: 'address[]',
                    },
                    {
                        name: 'takerTokens',
                        type: 'address[]',
                    },
                    {
                        name: 'minValidSalts',
                        type: 'uint256[]',
                    },
                ],
                name: 'batchCancelPairRfqOrdersWithSigner',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'orders',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                ],
                name: 'batchCancelRfqOrders',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'mtxs',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'signer',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'minGasPrice',
                                type: 'uint256',
                            },
                            {
                                name: 'maxGasPrice',
                                type: 'uint256',
                            },
                            {
                                name: 'expirationTimeSeconds',
                                type: 'uint256',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                            {
                                name: 'callData',
                                type: 'bytes',
                            },
                            {
                                name: 'value',
                                type: 'uint256',
                            },
                            {
                                name: 'feeToken',
                                type: 'address',
                            },
                            {
                                name: 'feeAmount',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signatures',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                ],
                name: 'batchExecuteMetaTransactions',
                outputs: [
                    {
                        name: 'returnResults',
                        type: 'bytes[]',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'orders',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerTokenFeeAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipient',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signatures',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerTokenFillAmounts',
                        type: 'uint128[]',
                    },
                    {
                        name: 'revertIfIncomplete',
                        type: 'bool',
                    },
                ],
                name: 'batchFillLimitOrders',
                outputs: [
                    {
                        name: 'takerTokenFilledAmounts',
                        type: 'uint128[]',
                    },
                    {
                        name: 'makerTokenFilledAmounts',
                        type: 'uint128[]',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'orders',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signatures',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerTokenFillAmounts',
                        type: 'uint128[]',
                    },
                    {
                        name: 'revertIfIncomplete',
                        type: 'bool',
                    },
                ],
                name: 'batchFillRfqOrders',
                outputs: [
                    {
                        name: 'takerTokenFilledAmounts',
                        type: 'uint128[]',
                    },
                    {
                        name: 'makerTokenFilledAmounts',
                        type: 'uint128[]',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'orders',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'expiryAndNonce',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'makerSignatures',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerSignatures',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'unwrapWeth',
                        type: 'bool[]',
                    },
                ],
                name: 'batchFillTakerSignedOtcOrders',
                outputs: [
                    {
                        name: 'successes',
                        type: 'bool[]',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'orders',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerTokenFeeAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipient',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signatures',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                ],
                name: 'batchGetLimitOrderRelevantStates',
                outputs: [
                    {
                        name: 'orderInfos',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'orderHash',
                                type: 'bytes32',
                            },
                            {
                                name: 'status',
                                type: 'uint8',
                            },
                            {
                                name: 'takerTokenFilledAmount',
                                type: 'uint128',
                            },
                        ],
                    },
                    {
                        name: 'actualFillableTakerTokenAmounts',
                        type: 'uint128[]',
                    },
                    {
                        name: 'isSignatureValids',
                        type: 'bool[]',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'orders',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signatures',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                ],
                name: 'batchGetRfqOrderRelevantStates',
                outputs: [
                    {
                        name: 'orderInfos',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'orderHash',
                                type: 'bytes32',
                            },
                            {
                                name: 'status',
                                type: 'uint8',
                            },
                            {
                                name: 'takerTokenFilledAmount',
                                type: 'uint128',
                            },
                        ],
                    },
                    {
                        name: 'actualFillableTakerTokenAmounts',
                        type: 'uint128[]',
                    },
                    {
                        name: 'isSignatureValids',
                        type: 'bool[]',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerTokenFeeAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipient',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                ],
                name: 'cancelLimitOrder',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'makerToken',
                        type: 'address',
                    },
                    {
                        name: 'takerToken',
                        type: 'address',
                    },
                    {
                        name: 'minValidSalt',
                        type: 'uint256',
                    },
                ],
                name: 'cancelPairLimitOrders',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'maker',
                        type: 'address',
                    },
                    {
                        name: 'makerToken',
                        type: 'address',
                    },
                    {
                        name: 'takerToken',
                        type: 'address',
                    },
                    {
                        name: 'minValidSalt',
                        type: 'uint256',
                    },
                ],
                name: 'cancelPairLimitOrdersWithSigner',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'makerToken',
                        type: 'address',
                    },
                    {
                        name: 'takerToken',
                        type: 'address',
                    },
                    {
                        name: 'minValidSalt',
                        type: 'uint256',
                    },
                ],
                name: 'cancelPairRfqOrders',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'maker',
                        type: 'address',
                    },
                    {
                        name: 'makerToken',
                        type: 'address',
                    },
                    {
                        name: 'takerToken',
                        type: 'address',
                    },
                    {
                        name: 'minValidSalt',
                        type: 'uint256',
                    },
                ],
                name: 'cancelPairRfqOrdersWithSigner',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                ],
                name: 'cancelRfqOrder',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [],
                name: 'createTransformWallet',
                outputs: [
                    {
                        name: 'wallet',
                        type: 'address',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'mtx',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signer',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'minGasPrice',
                                type: 'uint256',
                            },
                            {
                                name: 'maxGasPrice',
                                type: 'uint256',
                            },
                            {
                                name: 'expirationTimeSeconds',
                                type: 'uint256',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                            {
                                name: 'callData',
                                type: 'bytes',
                            },
                            {
                                name: 'value',
                                type: 'uint256',
                            },
                            {
                                name: 'feeToken',
                                type: 'address',
                            },
                            {
                                name: 'feeAmount',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                ],
                name: 'executeMetaTransaction',
                outputs: [
                    {
                        name: 'returnResult',
                        type: 'bytes',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'selector',
                        type: 'bytes4',
                    },
                    {
                        name: 'impl',
                        type: 'address',
                    },
                ],
                name: 'extend',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerTokenFeeAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipient',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerTokenFillAmount',
                        type: 'uint128',
                    },
                ],
                name: 'fillLimitOrder',
                outputs: [
                    {
                        name: 'takerTokenFilledAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'makerTokenFilledAmount',
                        type: 'uint128',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerTokenFeeAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipient',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerTokenFillAmount',
                        type: 'uint128',
                    },
                ],
                name: 'fillOrKillLimitOrder',
                outputs: [
                    {
                        name: 'makerTokenFilledAmount',
                        type: 'uint128',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerTokenFillAmount',
                        type: 'uint128',
                    },
                ],
                name: 'fillOrKillRfqOrder',
                outputs: [
                    {
                        name: 'makerTokenFilledAmount',
                        type: 'uint128',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'expiryAndNonce',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'makerSignature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerTokenFillAmount',
                        type: 'uint128',
                    },
                ],
                name: 'fillOtcOrder',
                outputs: [
                    {
                        name: 'takerTokenFilledAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'makerTokenFilledAmount',
                        type: 'uint128',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'expiryAndNonce',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'makerSignature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerTokenFillAmount',
                        type: 'uint128',
                    },
                ],
                name: 'fillOtcOrderForEth',
                outputs: [
                    {
                        name: 'takerTokenFilledAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'makerTokenFilledAmount',
                        type: 'uint128',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'expiryAndNonce',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'makerSignature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                ],
                name: 'fillOtcOrderWithEth',
                outputs: [
                    {
                        name: 'takerTokenFilledAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'makerTokenFilledAmount',
                        type: 'uint128',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerTokenFillAmount',
                        type: 'uint128',
                    },
                ],
                name: 'fillRfqOrder',
                outputs: [
                    {
                        name: 'takerTokenFilledAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'makerTokenFilledAmount',
                        type: 'uint128',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'expiryAndNonce',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'makerSignature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerSignature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                ],
                name: 'fillTakerSignedOtcOrder',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'expiryAndNonce',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'makerSignature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                    {
                        name: 'takerSignature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                ],
                name: 'fillTakerSignedOtcOrderForEth',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerTokenFeeAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipient',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                ],
                name: 'getLimitOrderHash',
                outputs: [
                    {
                        name: 'orderHash',
                        type: 'bytes32',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerTokenFeeAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipient',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                ],
                name: 'getLimitOrderInfo',
                outputs: [
                    {
                        name: 'orderInfo',
                        type: 'tuple',
                        components: [
                            {
                                name: 'orderHash',
                                type: 'bytes32',
                            },
                            {
                                name: 'status',
                                type: 'uint8',
                            },
                            {
                                name: 'takerTokenFilledAmount',
                                type: 'uint128',
                            },
                        ],
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerTokenFeeAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'feeRecipient',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                ],
                name: 'getLimitOrderRelevantState',
                outputs: [
                    {
                        name: 'orderInfo',
                        type: 'tuple',
                        components: [
                            {
                                name: 'orderHash',
                                type: 'bytes32',
                            },
                            {
                                name: 'status',
                                type: 'uint8',
                            },
                            {
                                name: 'takerTokenFilledAmount',
                                type: 'uint128',
                            },
                        ],
                    },
                    {
                        name: 'actualFillableTakerTokenAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'isSignatureValid',
                        type: 'bool',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'mtx',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signer',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'minGasPrice',
                                type: 'uint256',
                            },
                            {
                                name: 'maxGasPrice',
                                type: 'uint256',
                            },
                            {
                                name: 'expirationTimeSeconds',
                                type: 'uint256',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                            {
                                name: 'callData',
                                type: 'bytes',
                            },
                            {
                                name: 'value',
                                type: 'uint256',
                            },
                            {
                                name: 'feeToken',
                                type: 'address',
                            },
                            {
                                name: 'feeAmount',
                                type: 'uint256',
                            },
                        ],
                    },
                ],
                name: 'getMetaTransactionExecutedBlock',
                outputs: [
                    {
                        name: 'blockNumber',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'mtx',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signer',
                                type: 'address',
                            },
                            {
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                name: 'minGasPrice',
                                type: 'uint256',
                            },
                            {
                                name: 'maxGasPrice',
                                type: 'uint256',
                            },
                            {
                                name: 'expirationTimeSeconds',
                                type: 'uint256',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                            {
                                name: 'callData',
                                type: 'bytes',
                            },
                            {
                                name: 'value',
                                type: 'uint256',
                            },
                            {
                                name: 'feeToken',
                                type: 'address',
                            },
                            {
                                name: 'feeAmount',
                                type: 'uint256',
                            },
                        ],
                    },
                ],
                name: 'getMetaTransactionHash',
                outputs: [
                    {
                        name: 'mtxHash',
                        type: 'bytes32',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'mtxHash',
                        type: 'bytes32',
                    },
                ],
                name: 'getMetaTransactionHashExecutedBlock',
                outputs: [
                    {
                        name: 'blockNumber',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'expiryAndNonce',
                                type: 'uint256',
                            },
                        ],
                    },
                ],
                name: 'getOtcOrderHash',
                outputs: [
                    {
                        name: 'orderHash',
                        type: 'bytes32',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'expiryAndNonce',
                                type: 'uint256',
                            },
                        ],
                    },
                ],
                name: 'getOtcOrderInfo',
                outputs: [
                    {
                        name: 'orderInfo',
                        type: 'tuple',
                        components: [
                            {
                                name: 'orderHash',
                                type: 'bytes32',
                            },
                            {
                                name: 'status',
                                type: 'uint8',
                            },
                        ],
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [],
                name: 'getProtocolFeeMultiplier',
                outputs: [
                    {
                        name: 'multiplier',
                        type: 'uint32',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [],
                name: 'getQuoteSigner',
                outputs: [
                    {
                        name: 'signer',
                        type: 'address',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                ],
                name: 'getRfqOrderHash',
                outputs: [
                    {
                        name: 'orderHash',
                        type: 'bytes32',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                ],
                name: 'getRfqOrderInfo',
                outputs: [
                    {
                        name: 'orderInfo',
                        type: 'tuple',
                        components: [
                            {
                                name: 'orderHash',
                                type: 'bytes32',
                            },
                            {
                                name: 'status',
                                type: 'uint8',
                            },
                            {
                                name: 'takerTokenFilledAmount',
                                type: 'uint128',
                            },
                        ],
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'order',
                        type: 'tuple',
                        components: [
                            {
                                name: 'makerToken',
                                type: 'address',
                            },
                            {
                                name: 'takerToken',
                                type: 'address',
                            },
                            {
                                name: 'makerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'takerAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'maker',
                                type: 'address',
                            },
                            {
                                name: 'taker',
                                type: 'address',
                            },
                            {
                                name: 'txOrigin',
                                type: 'address',
                            },
                            {
                                name: 'pool',
                                type: 'bytes32',
                            },
                            {
                                name: 'expiry',
                                type: 'uint64',
                            },
                            {
                                name: 'salt',
                                type: 'uint256',
                            },
                        ],
                    },
                    {
                        name: 'signature',
                        type: 'tuple',
                        components: [
                            {
                                name: 'signatureType',
                                type: 'uint8',
                            },
                            {
                                name: 'v',
                                type: 'uint8',
                            },
                            {
                                name: 'r',
                                type: 'bytes32',
                            },
                            {
                                name: 's',
                                type: 'bytes32',
                            },
                        ],
                    },
                ],
                name: 'getRfqOrderRelevantState',
                outputs: [
                    {
                        name: 'orderInfo',
                        type: 'tuple',
                        components: [
                            {
                                name: 'orderHash',
                                type: 'bytes32',
                            },
                            {
                                name: 'status',
                                type: 'uint8',
                            },
                            {
                                name: 'takerTokenFilledAmount',
                                type: 'uint128',
                            },
                        ],
                    },
                    {
                        name: 'actualFillableTakerTokenAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'isSignatureValid',
                        type: 'bool',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'selector',
                        type: 'bytes4',
                    },
                    {
                        name: 'idx',
                        type: 'uint256',
                    },
                ],
                name: 'getRollbackEntryAtIndex',
                outputs: [
                    {
                        name: 'impl',
                        type: 'address',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'selector',
                        type: 'bytes4',
                    },
                ],
                name: 'getRollbackLength',
                outputs: [
                    {
                        name: 'rollbackLength',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [],
                name: 'getTransformWallet',
                outputs: [
                    {
                        name: 'wallet',
                        type: 'address',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [],
                name: 'getTransformerDeployer',
                outputs: [
                    {
                        name: 'deployer',
                        type: 'address',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'maker',
                        type: 'address',
                    },
                    {
                        name: 'signer',
                        type: 'address',
                    },
                ],
                name: 'isValidOrderSigner',
                outputs: [
                    {
                        name: 'isAllowed',
                        type: 'bool',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'txOrigin',
                        type: 'address',
                    },
                    {
                        name: 'nonceBucket',
                        type: 'uint64',
                    },
                ],
                name: 'lastOtcTxOriginNonce',
                outputs: [
                    {
                        name: 'lastNonce',
                        type: 'uint128',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'target',
                        type: 'address',
                    },
                    {
                        name: 'data',
                        type: 'bytes',
                    },
                    {
                        name: 'newOwner',
                        type: 'address',
                    },
                ],
                name: 'migrate',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'outputToken',
                        type: 'address',
                    },
                    {
                        name: 'calls',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'id',
                                type: 'uint8',
                            },
                            {
                                name: 'sellAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'data',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'minBuyAmount',
                        type: 'uint256',
                    },
                ],
                name: 'multiplexBatchSellEthForToken',
                outputs: [
                    {
                        name: 'boughtAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'inputToken',
                        type: 'address',
                    },
                    {
                        name: 'calls',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'id',
                                type: 'uint8',
                            },
                            {
                                name: 'sellAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'data',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'sellAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'minBuyAmount',
                        type: 'uint256',
                    },
                ],
                name: 'multiplexBatchSellTokenForEth',
                outputs: [
                    {
                        name: 'boughtAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'inputToken',
                        type: 'address',
                    },
                    {
                        name: 'outputToken',
                        type: 'address',
                    },
                    {
                        name: 'calls',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'id',
                                type: 'uint8',
                            },
                            {
                                name: 'sellAmount',
                                type: 'uint256',
                            },
                            {
                                name: 'data',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'sellAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'minBuyAmount',
                        type: 'uint256',
                    },
                ],
                name: 'multiplexBatchSellTokenForToken',
                outputs: [
                    {
                        name: 'boughtAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'tokens',
                        type: 'address[]',
                    },
                    {
                        name: 'calls',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'id',
                                type: 'uint8',
                            },
                            {
                                name: 'data',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'minBuyAmount',
                        type: 'uint256',
                    },
                ],
                name: 'multiplexMultiHopSellEthForToken',
                outputs: [
                    {
                        name: 'boughtAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'tokens',
                        type: 'address[]',
                    },
                    {
                        name: 'calls',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'id',
                                type: 'uint8',
                            },
                            {
                                name: 'data',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'sellAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'minBuyAmount',
                        type: 'uint256',
                    },
                ],
                name: 'multiplexMultiHopSellTokenForEth',
                outputs: [
                    {
                        name: 'boughtAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'tokens',
                        type: 'address[]',
                    },
                    {
                        name: 'calls',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'id',
                                type: 'uint8',
                            },
                            {
                                name: 'data',
                                type: 'bytes',
                            },
                        ],
                    },
                    {
                        name: 'sellAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'minBuyAmount',
                        type: 'uint256',
                    },
                ],
                name: 'multiplexMultiHopSellTokenForToken',
                outputs: [
                    {
                        name: 'boughtAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [],
                name: 'owner',
                outputs: [
                    {
                        name: 'ownerAddress',
                        type: 'address',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'signer',
                        type: 'address',
                    },
                    {
                        name: 'allowed',
                        type: 'bool',
                    },
                ],
                name: 'registerAllowedOrderSigner',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'origins',
                        type: 'address[]',
                    },
                    {
                        name: 'allowed',
                        type: 'bool',
                    },
                ],
                name: 'registerAllowedRfqOrigins',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'selector',
                        type: 'bytes4',
                    },
                    {
                        name: 'targetImpl',
                        type: 'address',
                    },
                ],
                name: 'rollback',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'encodedPath',
                        type: 'bytes',
                    },
                    {
                        name: 'minBuyAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'recipient',
                        type: 'address',
                    },
                ],
                name: 'sellEthForTokenToUniswapV3',
                outputs: [
                    {
                        name: 'buyAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'inputToken',
                        type: 'address',
                    },
                    {
                        name: 'outputToken',
                        type: 'address',
                    },
                    {
                        name: 'provider',
                        type: 'address',
                    },
                    {
                        name: 'recipient',
                        type: 'address',
                    },
                    {
                        name: 'sellAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'minBuyAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'auxiliaryData',
                        type: 'bytes',
                    },
                ],
                name: 'sellToLiquidityProvider',
                outputs: [
                    {
                        name: 'boughtAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'tokens',
                        type: 'address[]',
                    },
                    {
                        name: 'sellAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'minBuyAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'fork',
                        type: 'uint8',
                    },
                ],
                name: 'sellToPancakeSwap',
                outputs: [
                    {
                        name: 'buyAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'tokens',
                        type: 'address[]',
                    },
                    {
                        name: 'sellAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'minBuyAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'isSushi',
                        type: 'bool',
                    },
                ],
                name: 'sellToUniswap',
                outputs: [
                    {
                        name: 'buyAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'encodedPath',
                        type: 'bytes',
                    },
                    {
                        name: 'sellAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'minBuyAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'recipient',
                        type: 'address',
                    },
                ],
                name: 'sellTokenForEthToUniswapV3',
                outputs: [
                    {
                        name: 'buyAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'encodedPath',
                        type: 'bytes',
                    },
                    {
                        name: 'sellAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'minBuyAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'recipient',
                        type: 'address',
                    },
                ],
                name: 'sellTokenForTokenToUniswapV3',
                outputs: [
                    {
                        name: 'buyAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'quoteSigner',
                        type: 'address',
                    },
                ],
                name: 'setQuoteSigner',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'transformerDeployer',
                        type: 'address',
                    },
                ],
                name: 'setTransformerDeployer',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'newOwner',
                        type: 'address',
                    },
                ],
                name: 'transferOwnership',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'poolIds',
                        type: 'bytes32[]',
                    },
                ],
                name: 'transferProtocolFeesForPools',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'inputToken',
                        type: 'address',
                    },
                    {
                        name: 'outputToken',
                        type: 'address',
                    },
                    {
                        name: 'inputTokenAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'minOutputTokenAmount',
                        type: 'uint256',
                    },
                    {
                        name: 'transformations',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'deploymentNonce',
                                type: 'uint32',
                            },
                            {
                                name: 'data',
                                type: 'bytes',
                            },
                        ],
                    },
                ],
                name: 'transformERC20',
                outputs: [
                    {
                        name: 'outputTokenAmount',
                        type: 'uint256',
                    },
                ],
                stateMutability: 'payable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        name: 'amount0Delta',
                        type: 'int256',
                    },
                    {
                        name: 'amount1Delta',
                        type: 'int256',
                    },
                    {
                        name: 'data',
                        type: 'bytes',
                    },
                ],
                name: 'uniswapV3SwapCallback',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
        ] as ContractAbi;
        return abi;
    }

    protected static async _deployLibrariesAsync(
        artifact: ContractArtifact,
        libraryArtifacts: { [libraryName: string]: ContractArtifact },
        web3Wrapper: Web3Wrapper,
        txDefaults: Partial<TxData>,
        libraryAddresses: { [libraryName: string]: string } = {},
    ): Promise<{ [libraryName: string]: string }> {
        const links = artifact.compilerOutput.evm.bytecode.linkReferences;
        // Go through all linked libraries, recursively deploying them if necessary.
        for (const link of Object.values(links)) {
            for (const libraryName of Object.keys(link)) {
                if (!libraryAddresses[libraryName]) {
                    // Library not yet deployed.
                    const libraryArtifact = libraryArtifacts[libraryName];
                    if (!libraryArtifact) {
                        throw new Error(`Missing artifact for linked library "${libraryName}"`);
                    }
                    // Deploy any dependent libraries used by this library.
                    await IZeroExContract._deployLibrariesAsync(
                        libraryArtifact,
                        libraryArtifacts,
                        web3Wrapper,
                        txDefaults,
                        libraryAddresses,
                    );
                    // Deploy this library.
                    const linkedLibraryBytecode = linkLibrariesInBytecode(libraryArtifact, libraryAddresses);
                    const txDataWithDefaults = await BaseContract._applyDefaultsToContractTxDataAsync(
                        {
                            data: linkedLibraryBytecode,
                            ...txDefaults,
                        },
                        web3Wrapper.estimateGasAsync.bind(web3Wrapper),
                    );
                    const txHash = await web3Wrapper.sendTransactionAsync(txDataWithDefaults);
                    logUtils.log(`transactionHash: ${txHash}`);
                    const { contractAddress } = await web3Wrapper.awaitTransactionSuccessAsync(txHash);
                    logUtils.log(`${libraryArtifact.contractName} successfully deployed at ${contractAddress}`);
                    libraryAddresses[libraryArtifact.contractName] = contractAddress as string;
                }
            }
        }
        return libraryAddresses;
    }

    public getFunctionSignature(methodName: string): string {
        const index = this._methodABIIndex[methodName];
        const methodAbi = IZeroExContract.ABI()[index] as MethodAbi; // tslint:disable-line:no-unnecessary-type-assertion
        const functionSignature = methodAbiToFunctionSignature(methodAbi);
        return functionSignature;
    }

    public getABIDecodedTransactionData<T>(methodName: string, callData: string): T {
        const functionSignature = this.getFunctionSignature(methodName);
        const self = (this as any) as IZeroExContract;
        const abiEncoder = self._lookupAbiEncoder(functionSignature);
        const abiDecodedCallData = abiEncoder.strictDecode<T>(callData);
        return abiDecodedCallData;
    }

    public getABIDecodedReturnData<T>(methodName: string, callData: string): T {
        if (this._encoderOverrides.decodeOutput) {
            return this._encoderOverrides.decodeOutput(methodName, callData);
        }
        const functionSignature = this.getFunctionSignature(methodName);
        const self = (this as any) as IZeroExContract;
        const abiEncoder = self._lookupAbiEncoder(functionSignature);
        const abiDecodedCallData = abiEncoder.strictDecodeReturnValue<T>(callData);
        return abiDecodedCallData;
    }

    public getSelector(methodName: string): string {
        const functionSignature = this.getFunctionSignature(methodName);
        const self = (this as any) as IZeroExContract;
        const abiEncoder = self._lookupAbiEncoder(functionSignature);
        return abiEncoder.getSelector();
    }

    /**
     * Fill a limit order. Internal variant. ETH protocol fees can be
     * attached to this call. Any unspent ETH will be refunded to
     * `msg.sender` (not `sender`).
     * @param order The limit order.
     * @param signature The order signature.
     * @param takerTokenFillAmount Maximum taker token to fill this order with.
     * @param taker The order taker.
     * @param sender The order sender.
     */
    public _fillLimitOrder(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            takerTokenFeeAmount: BigNumber;
            maker: string;
            taker: string;
            sender: string;
            feeRecipient: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        },
        signature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
        takerTokenFillAmount: BigNumber,
        taker: string,
        sender: string,
    ): ContractTxFunctionObj<[BigNumber, BigNumber]> {
        const self = (this as any) as IZeroExContract;

        assert.isBigNumber('takerTokenFillAmount', takerTokenFillAmount);
        assert.isString('taker', taker);
        assert.isString('sender', sender);
        const functionSignature =
            '_fillLimitOrder((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256),(uint8,uint8,bytes32,bytes32),uint128,address,address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<[BigNumber, BigNumber]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<[BigNumber, BigNumber]>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    order,
                    signature,
                    takerTokenFillAmount,
                    taker.toLowerCase(),
                    sender.toLowerCase(),
                ]);
            },
        };
    }
    /**
     * Fill an OTC order for up to `takerTokenFillAmount` taker tokens.
     * Internal variant.
     * @param order The OTC order.
     * @param makerSignature The order signature from the maker.
     * @param takerTokenFillAmount Maximum taker token amount to fill this
     *     order with.
     * @param taker The address to fill the order in the context of.
     * @param useSelfBalance Whether to use the Exchange Proxy's balance        of
     *     input tokens.
     * @param recipient The recipient of the bought maker tokens.
     */
    public _fillOtcOrder(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            expiryAndNonce: BigNumber;
        },
        makerSignature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
        takerTokenFillAmount: BigNumber,
        taker: string,
        useSelfBalance: boolean,
        recipient: string,
    ): ContractTxFunctionObj<[BigNumber, BigNumber]> {
        const self = (this as any) as IZeroExContract;

        assert.isBigNumber('takerTokenFillAmount', takerTokenFillAmount);
        assert.isString('taker', taker);
        assert.isBoolean('useSelfBalance', useSelfBalance);
        assert.isString('recipient', recipient);
        const functionSignature =
            '_fillOtcOrder((address,address,uint128,uint128,address,address,address,uint256),(uint8,uint8,bytes32,bytes32),uint128,address,bool,address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<[BigNumber, BigNumber]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<[BigNumber, BigNumber]>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    order,
                    makerSignature,
                    takerTokenFillAmount,
                    taker.toLowerCase(),
                    useSelfBalance,
                    recipient.toLowerCase(),
                ]);
            },
        };
    }
    /**
     * Fill an RFQ order. Internal variant.
     * @param order The RFQ order.
     * @param signature The order signature.
     * @param takerTokenFillAmount Maximum taker token to fill this order with.
     * @param taker The order taker.
     * @param useSelfBalance Whether to use the ExchangeProxy's transient
     *     balance of taker tokens to fill the order.
     * @param recipient The recipient of the maker tokens.
     */
    public _fillRfqOrder(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        },
        signature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
        takerTokenFillAmount: BigNumber,
        taker: string,
        useSelfBalance: boolean,
        recipient: string,
    ): ContractTxFunctionObj<[BigNumber, BigNumber]> {
        const self = (this as any) as IZeroExContract;

        assert.isBigNumber('takerTokenFillAmount', takerTokenFillAmount);
        assert.isString('taker', taker);
        assert.isBoolean('useSelfBalance', useSelfBalance);
        assert.isString('recipient', recipient);
        const functionSignature =
            '_fillRfqOrder((address,address,uint128,uint128,address,address,address,bytes32,uint64,uint256),(uint8,uint8,bytes32,bytes32),uint128,address,bool,address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<[BigNumber, BigNumber]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<[BigNumber, BigNumber]>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    order,
                    signature,
                    takerTokenFillAmount,
                    taker.toLowerCase(),
                    useSelfBalance,
                    recipient.toLowerCase(),
                ]);
            },
        };
    }
    /**
     * Sell a token for another token directly against uniswap v3.
     * Private variant, uses tokens held by `address(this)`.
     * @param encodedPath Uniswap-encoded path.
     * @param sellAmount amount of the first token in the path to sell.
     * @param minBuyAmount Minimum amount of the last token in the path to buy.
     * @param recipient The recipient of the bought tokens. Can be zero for sender.
     */
    public _sellHeldTokenForTokenToUniswapV3(
        encodedPath: string,
        sellAmount: BigNumber,
        minBuyAmount: BigNumber,
        recipient: string,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isString('encodedPath', encodedPath);
        assert.isBigNumber('sellAmount', sellAmount);
        assert.isBigNumber('minBuyAmount', minBuyAmount);
        assert.isString('recipient', recipient);
        const functionSignature = '_sellHeldTokenForTokenToUniswapV3(bytes,uint256,uint256,address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    encodedPath,
                    sellAmount,
                    minBuyAmount,
                    recipient.toLowerCase(),
                ]);
            },
        };
    }
    /**
     * Internal version of `transformERC20()`. Only callable from within.
     * @param args A `TransformERC20Args` struct.
     */
    public _transformERC20(args: {
        taker: string;
        inputToken: string;
        outputToken: string;
        inputTokenAmount: BigNumber;
        minOutputTokenAmount: BigNumber;
        transformations: Array<{ deploymentNonce: number | BigNumber; data: string }>;
        useSelfBalance: boolean;
        recipient: string;
    }): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            '_transformERC20((address,address,address,uint256,uint256,(uint32,bytes)[],bool,address))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [args]);
            },
        };
    }
    /**
     * Cancel multiple limit orders. The caller must be the maker or a valid order signer.
     * Silently succeeds if the order has already been cancelled.
     * @param orders The limit orders.
     */
    public batchCancelLimitOrders(
        orders: Array<{
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            takerTokenFeeAmount: BigNumber;
            maker: string;
            taker: string;
            sender: string;
            feeRecipient: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        }>,
    ): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('orders', orders);
        const functionSignature =
            'batchCancelLimitOrders((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256)[])';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [orders]);
            },
        };
    }
    /**
     * Cancel all limit orders for a given maker and pairs with salts less
     * than the values provided. The caller must be the maker. Subsequent
     * calls to this function with the same caller and pair require the
     * new salt to be >= the old salt.
     * @param makerTokens The maker tokens.
     * @param takerTokens The taker tokens.
     * @param minValidSalts The new minimum valid salts.
     */
    public batchCancelPairLimitOrders(
        makerTokens: string[],
        takerTokens: string[],
        minValidSalts: BigNumber[],
    ): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('makerTokens', makerTokens);
        assert.isArray('takerTokens', takerTokens);
        assert.isArray('minValidSalts', minValidSalts);
        const functionSignature = 'batchCancelPairLimitOrders(address[],address[],uint256[])';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [makerTokens, takerTokens, minValidSalts]);
            },
        };
    }
    /**
     * Cancel all limit orders for a given maker and pairs with salts less
     * than the values provided. The caller must be a signer registered to the maker.
     * Subsequent calls to this function with the same maker and pair require the
     * new salt to be >= the old salt.
     * @param maker The maker for which to cancel.
     * @param makerTokens The maker tokens.
     * @param takerTokens The taker tokens.
     * @param minValidSalts The new minimum valid salts.
     */
    public batchCancelPairLimitOrdersWithSigner(
        maker: string,
        makerTokens: string[],
        takerTokens: string[],
        minValidSalts: BigNumber[],
    ): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isString('maker', maker);
        assert.isArray('makerTokens', makerTokens);
        assert.isArray('takerTokens', takerTokens);
        assert.isArray('minValidSalts', minValidSalts);
        const functionSignature = 'batchCancelPairLimitOrdersWithSigner(address,address[],address[],uint256[])';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    maker.toLowerCase(),
                    makerTokens,
                    takerTokens,
                    minValidSalts,
                ]);
            },
        };
    }
    /**
     * Cancel all RFQ orders for a given maker and pairs with salts less
     * than the values provided. The caller must be the maker. Subsequent
     * calls to this function with the same caller and pair require the
     * new salt to be >= the old salt.
     * @param makerTokens The maker tokens.
     * @param takerTokens The taker tokens.
     * @param minValidSalts The new minimum valid salts.
     */
    public batchCancelPairRfqOrders(
        makerTokens: string[],
        takerTokens: string[],
        minValidSalts: BigNumber[],
    ): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('makerTokens', makerTokens);
        assert.isArray('takerTokens', takerTokens);
        assert.isArray('minValidSalts', minValidSalts);
        const functionSignature = 'batchCancelPairRfqOrders(address[],address[],uint256[])';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [makerTokens, takerTokens, minValidSalts]);
            },
        };
    }
    /**
     * Cancel all RFQ orders for a given maker and pairs with salts less
     * than the values provided. The caller must be a signer registered to the maker.
     * Subsequent calls to this function with the same maker and pair require the
     * new salt to be >= the old salt.
     * @param maker The maker for which to cancel.
     * @param makerTokens The maker tokens.
     * @param takerTokens The taker tokens.
     * @param minValidSalts The new minimum valid salts.
     */
    public batchCancelPairRfqOrdersWithSigner(
        maker: string,
        makerTokens: string[],
        takerTokens: string[],
        minValidSalts: BigNumber[],
    ): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isString('maker', maker);
        assert.isArray('makerTokens', makerTokens);
        assert.isArray('takerTokens', takerTokens);
        assert.isArray('minValidSalts', minValidSalts);
        const functionSignature = 'batchCancelPairRfqOrdersWithSigner(address,address[],address[],uint256[])';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    maker.toLowerCase(),
                    makerTokens,
                    takerTokens,
                    minValidSalts,
                ]);
            },
        };
    }
    /**
     * Cancel multiple RFQ orders. The caller must be the maker or a valid order signer.
     * Silently succeeds if the order has already been cancelled.
     * @param orders The RFQ orders.
     */
    public batchCancelRfqOrders(
        orders: Array<{
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        }>,
    ): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('orders', orders);
        const functionSignature =
            'batchCancelRfqOrders((address,address,uint128,uint128,address,address,address,bytes32,uint64,uint256)[])';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [orders]);
            },
        };
    }
    /**
     * Execute multiple meta-transactions.
     * @param mtxs The meta-transactions.
     * @param signatures The signature by each respective `mtx.signer`.
     */
    public batchExecuteMetaTransactions(
        mtxs: Array<{
            signer: string;
            sender: string;
            minGasPrice: BigNumber;
            maxGasPrice: BigNumber;
            expirationTimeSeconds: BigNumber;
            salt: BigNumber;
            callData: string;
            value: BigNumber;
            feeToken: string;
            feeAmount: BigNumber;
        }>,
        signatures: Array<{ signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string }>,
    ): ContractTxFunctionObj<string[]> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('mtxs', mtxs);
        assert.isArray('signatures', signatures);
        const functionSignature =
            'batchExecuteMetaTransactions((address,address,uint256,uint256,uint256,uint256,bytes,uint256,address,uint256)[],(uint8,uint8,bytes32,bytes32)[])';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string[]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<string[]>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [mtxs, signatures]);
            },
        };
    }
    /**
     * Fills multiple limit orders.
     * @param orders Array of limit orders.
     * @param signatures Array of signatures corresponding to each order.
     * @param takerTokenFillAmounts Array of desired amounts to fill each order.
     * @param revertIfIncomplete If true, reverts if this function fails to
     *     fill the full fill amount for any individual order.
     */
    public batchFillLimitOrders(
        orders: Array<{
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            takerTokenFeeAmount: BigNumber;
            maker: string;
            taker: string;
            sender: string;
            feeRecipient: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        }>,
        signatures: Array<{ signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string }>,
        takerTokenFillAmounts: BigNumber[],
        revertIfIncomplete: boolean,
    ): ContractTxFunctionObj<[BigNumber[], BigNumber[]]> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('orders', orders);
        assert.isArray('signatures', signatures);
        assert.isArray('takerTokenFillAmounts', takerTokenFillAmounts);
        assert.isBoolean('revertIfIncomplete', revertIfIncomplete);
        const functionSignature =
            'batchFillLimitOrders((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256)[],(uint8,uint8,bytes32,bytes32)[],uint128[],bool)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<[BigNumber[], BigNumber[]]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<[BigNumber[], BigNumber[]]>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    orders,
                    signatures,
                    takerTokenFillAmounts,
                    revertIfIncomplete,
                ]);
            },
        };
    }
    /**
     * Fills multiple RFQ orders.
     * @param orders Array of RFQ orders.
     * @param signatures Array of signatures corresponding to each order.
     * @param takerTokenFillAmounts Array of desired amounts to fill each order.
     * @param revertIfIncomplete If true, reverts if this function fails to
     *     fill the full fill amount for any individual order.
     */
    public batchFillRfqOrders(
        orders: Array<{
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        }>,
        signatures: Array<{ signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string }>,
        takerTokenFillAmounts: BigNumber[],
        revertIfIncomplete: boolean,
    ): ContractTxFunctionObj<[BigNumber[], BigNumber[]]> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('orders', orders);
        assert.isArray('signatures', signatures);
        assert.isArray('takerTokenFillAmounts', takerTokenFillAmounts);
        assert.isBoolean('revertIfIncomplete', revertIfIncomplete);
        const functionSignature =
            'batchFillRfqOrders((address,address,uint128,uint128,address,address,address,bytes32,uint64,uint256)[],(uint8,uint8,bytes32,bytes32)[],uint128[],bool)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<[BigNumber[], BigNumber[]]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<[BigNumber[], BigNumber[]]>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    orders,
                    signatures,
                    takerTokenFillAmounts,
                    revertIfIncomplete,
                ]);
            },
        };
    }
    /**
     * Fills multiple taker-signed OTC orders.
     * @param orders Array of OTC orders.
     * @param makerSignatures Array of maker signatures for each order.
     * @param takerSignatures Array of taker signatures for each order.
     * @param unwrapWeth Array of booleans representing whether or not         to
     *     unwrap bought WETH into ETH for each order. Should be set         to
     *     false if the maker token is not WETH.
     */
    public batchFillTakerSignedOtcOrders(
        orders: Array<{
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            expiryAndNonce: BigNumber;
        }>,
        makerSignatures: Array<{ signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string }>,
        takerSignatures: Array<{ signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string }>,
        unwrapWeth: boolean[],
    ): ContractTxFunctionObj<boolean[]> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('orders', orders);
        assert.isArray('makerSignatures', makerSignatures);
        assert.isArray('takerSignatures', takerSignatures);
        assert.isArray('unwrapWeth', unwrapWeth);
        const functionSignature =
            'batchFillTakerSignedOtcOrders((address,address,uint128,uint128,address,address,address,uint256)[],(uint8,uint8,bytes32,bytes32)[],(uint8,uint8,bytes32,bytes32)[],bool[])';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<boolean[]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<boolean[]>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    orders,
                    makerSignatures,
                    takerSignatures,
                    unwrapWeth,
                ]);
            },
        };
    }
    /**
     * Batch version of `getLimitOrderRelevantState()`, without reverting.
     * Orders that would normally cause `getLimitOrderRelevantState()`
     * to revert will have empty results.
     * @param orders The limit orders.
     * @param signatures The order signatures.
     */
    public batchGetLimitOrderRelevantStates(
        orders: Array<{
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            takerTokenFeeAmount: BigNumber;
            maker: string;
            taker: string;
            sender: string;
            feeRecipient: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        }>,
        signatures: Array<{ signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string }>,
    ): ContractTxFunctionObj<
        [Array<{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }>, BigNumber[], boolean[]]
    > {
        const self = (this as any) as IZeroExContract;
        assert.isArray('orders', orders);
        assert.isArray('signatures', signatures);
        const functionSignature =
            'batchGetLimitOrderRelevantStates((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256)[],(uint8,uint8,bytes32,bytes32)[])';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<
                [
                    Array<{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }>,
                    BigNumber[],
                    boolean[],
                ]
            > {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<
                    [
                        Array<{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }>,
                        BigNumber[],
                        boolean[],
                    ]
                >(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [orders, signatures]);
            },
        };
    }
    /**
     * Batch version of `getRfqOrderRelevantState()`, without reverting.
     * Orders that would normally cause `getRfqOrderRelevantState()`
     * to revert will have empty results.
     * @param orders The RFQ orders.
     * @param signatures The order signatures.
     */
    public batchGetRfqOrderRelevantStates(
        orders: Array<{
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        }>,
        signatures: Array<{ signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string }>,
    ): ContractTxFunctionObj<
        [Array<{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }>, BigNumber[], boolean[]]
    > {
        const self = (this as any) as IZeroExContract;
        assert.isArray('orders', orders);
        assert.isArray('signatures', signatures);
        const functionSignature =
            'batchGetRfqOrderRelevantStates((address,address,uint128,uint128,address,address,address,bytes32,uint64,uint256)[],(uint8,uint8,bytes32,bytes32)[])';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<
                [
                    Array<{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }>,
                    BigNumber[],
                    boolean[],
                ]
            > {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<
                    [
                        Array<{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }>,
                        BigNumber[],
                        boolean[],
                    ]
                >(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [orders, signatures]);
            },
        };
    }
    /**
     * Cancel a single limit order. The caller must be the maker or a valid order signer.
     * Silently succeeds if the order has already been cancelled.
     * @param order The limit order.
     */
    public cancelLimitOrder(order: {
        makerToken: string;
        takerToken: string;
        makerAmount: BigNumber;
        takerAmount: BigNumber;
        takerTokenFeeAmount: BigNumber;
        maker: string;
        taker: string;
        sender: string;
        feeRecipient: string;
        pool: string;
        expiry: BigNumber;
        salt: BigNumber;
    }): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'cancelLimitOrder((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order]);
            },
        };
    }
    /**
     * Cancel all limit orders for a given maker and pair with a salt less
     * than the value provided. The caller must be the maker. Subsequent
     * calls to this function with the same caller and pair require the
     * new salt to be >= the old salt.
     * @param makerToken The maker token.
     * @param takerToken The taker token.
     * @param minValidSalt The new minimum valid salt.
     */
    public cancelPairLimitOrders(
        makerToken: string,
        takerToken: string,
        minValidSalt: BigNumber,
    ): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isString('makerToken', makerToken);
        assert.isString('takerToken', takerToken);
        assert.isBigNumber('minValidSalt', minValidSalt);
        const functionSignature = 'cancelPairLimitOrders(address,address,uint256)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    makerToken.toLowerCase(),
                    takerToken.toLowerCase(),
                    minValidSalt,
                ]);
            },
        };
    }
    /**
     * Cancel all limit orders for a given maker and pair with a salt less
     * than the value provided. The caller must be a signer registered to the maker.
     * Subsequent calls to this function with the same maker and pair require the
     * new salt to be >= the old salt.
     * @param maker The maker for which to cancel.
     * @param makerToken The maker token.
     * @param takerToken The taker token.
     * @param minValidSalt The new minimum valid salt.
     */
    public cancelPairLimitOrdersWithSigner(
        maker: string,
        makerToken: string,
        takerToken: string,
        minValidSalt: BigNumber,
    ): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isString('maker', maker);
        assert.isString('makerToken', makerToken);
        assert.isString('takerToken', takerToken);
        assert.isBigNumber('minValidSalt', minValidSalt);
        const functionSignature = 'cancelPairLimitOrdersWithSigner(address,address,address,uint256)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    maker.toLowerCase(),
                    makerToken.toLowerCase(),
                    takerToken.toLowerCase(),
                    minValidSalt,
                ]);
            },
        };
    }
    /**
     * Cancel all RFQ orders for a given maker and pair with a salt less
     * than the value provided. The caller must be the maker. Subsequent
     * calls to this function with the same caller and pair require the
     * new salt to be >= the old salt.
     * @param makerToken The maker token.
     * @param takerToken The taker token.
     * @param minValidSalt The new minimum valid salt.
     */
    public cancelPairRfqOrders(
        makerToken: string,
        takerToken: string,
        minValidSalt: BigNumber,
    ): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isString('makerToken', makerToken);
        assert.isString('takerToken', takerToken);
        assert.isBigNumber('minValidSalt', minValidSalt);
        const functionSignature = 'cancelPairRfqOrders(address,address,uint256)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    makerToken.toLowerCase(),
                    takerToken.toLowerCase(),
                    minValidSalt,
                ]);
            },
        };
    }
    /**
     * Cancel all RFQ orders for a given maker and pair with a salt less
     * than the value provided. The caller must be a signer registered to the maker.
     * Subsequent calls to this function with the same maker and pair require the
     * new salt to be >= the old salt.
     * @param maker The maker for which to cancel.
     * @param makerToken The maker token.
     * @param takerToken The taker token.
     * @param minValidSalt The new minimum valid salt.
     */
    public cancelPairRfqOrdersWithSigner(
        maker: string,
        makerToken: string,
        takerToken: string,
        minValidSalt: BigNumber,
    ): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isString('maker', maker);
        assert.isString('makerToken', makerToken);
        assert.isString('takerToken', takerToken);
        assert.isBigNumber('minValidSalt', minValidSalt);
        const functionSignature = 'cancelPairRfqOrdersWithSigner(address,address,address,uint256)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    maker.toLowerCase(),
                    makerToken.toLowerCase(),
                    takerToken.toLowerCase(),
                    minValidSalt,
                ]);
            },
        };
    }
    /**
     * Cancel a single RFQ order. The caller must be the maker or a valid order signer.
     * Silently succeeds if the order has already been cancelled.
     * @param order The RFQ order.
     */
    public cancelRfqOrder(order: {
        makerToken: string;
        takerToken: string;
        makerAmount: BigNumber;
        takerAmount: BigNumber;
        maker: string;
        taker: string;
        txOrigin: string;
        pool: string;
        expiry: BigNumber;
        salt: BigNumber;
    }): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'cancelRfqOrder((address,address,uint128,uint128,address,address,address,bytes32,uint64,uint256))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order]);
            },
        };
    }
    /**
     * Deploy a new flash wallet instance and replace the current one with it.
     * Useful if we somehow break the current wallet instance.
     * Only callable by the owner.
     */
    public createTransformWallet(): ContractTxFunctionObj<string> {
        const self = (this as any) as IZeroExContract;
        const functionSignature = 'createTransformWallet()';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
    /**
     * Execute a single meta-transaction.
     * @param mtx The meta-transaction.
     * @param signature The signature by `mtx.signer`.
     */
    public executeMetaTransaction(
        mtx: {
            signer: string;
            sender: string;
            minGasPrice: BigNumber;
            maxGasPrice: BigNumber;
            expirationTimeSeconds: BigNumber;
            salt: BigNumber;
            callData: string;
            value: BigNumber;
            feeToken: string;
            feeAmount: BigNumber;
        },
        signature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
    ): ContractTxFunctionObj<string> {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'executeMetaTransaction((address,address,uint256,uint256,uint256,uint256,bytes,uint256,address,uint256),(uint8,uint8,bytes32,bytes32))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [mtx, signature]);
            },
        };
    }
    /**
     * Register or replace a function.
     * @param selector The function selector.
     * @param impl The implementation contract for the function.
     */
    public extend(selector: string, impl: string): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isString('selector', selector);
        assert.isString('impl', impl);
        const functionSignature = 'extend(bytes4,address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [selector, impl.toLowerCase()]);
            },
        };
    }
    /**
     * Fill a limit order. The taker and sender will be the caller.
     * @param order The limit order. ETH protocol fees can be      attached to this
     *     call. Any unspent ETH will be refunded to      the caller.
     * @param signature The order signature.
     * @param takerTokenFillAmount Maximum taker token amount to fill this order
     *     with.
     */
    public fillLimitOrder(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            takerTokenFeeAmount: BigNumber;
            maker: string;
            taker: string;
            sender: string;
            feeRecipient: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        },
        signature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
        takerTokenFillAmount: BigNumber,
    ): ContractTxFunctionObj<[BigNumber, BigNumber]> {
        const self = (this as any) as IZeroExContract;

        assert.isBigNumber('takerTokenFillAmount', takerTokenFillAmount);
        const functionSignature =
            'fillLimitOrder((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256),(uint8,uint8,bytes32,bytes32),uint128)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<[BigNumber, BigNumber]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<[BigNumber, BigNumber]>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order, signature, takerTokenFillAmount]);
            },
        };
    }
    /**
     * Fill an RFQ order for exactly `takerTokenFillAmount` taker tokens.
     * The taker will be the caller. ETH protocol fees can be
     * attached to this call. Any unspent ETH will be refunded to
     * the caller.
     * @param order The limit order.
     * @param signature The order signature.
     * @param takerTokenFillAmount How much taker token to fill this order with.
     */
    public fillOrKillLimitOrder(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            takerTokenFeeAmount: BigNumber;
            maker: string;
            taker: string;
            sender: string;
            feeRecipient: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        },
        signature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
        takerTokenFillAmount: BigNumber,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;

        assert.isBigNumber('takerTokenFillAmount', takerTokenFillAmount);
        const functionSignature =
            'fillOrKillLimitOrder((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256),(uint8,uint8,bytes32,bytes32),uint128)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order, signature, takerTokenFillAmount]);
            },
        };
    }
    /**
     * Fill an RFQ order for exactly `takerTokenFillAmount` taker tokens.
     * The taker will be the caller.
     * @param order The RFQ order.
     * @param signature The order signature.
     * @param takerTokenFillAmount How much taker token to fill this order with.
     */
    public fillOrKillRfqOrder(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        },
        signature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
        takerTokenFillAmount: BigNumber,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;

        assert.isBigNumber('takerTokenFillAmount', takerTokenFillAmount);
        const functionSignature =
            'fillOrKillRfqOrder((address,address,uint128,uint128,address,address,address,bytes32,uint64,uint256),(uint8,uint8,bytes32,bytes32),uint128)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order, signature, takerTokenFillAmount]);
            },
        };
    }
    /**
     * Fill an OTC order for up to `takerTokenFillAmount` taker tokens.
     * @param order The OTC order.
     * @param makerSignature The order signature from the maker.
     * @param takerTokenFillAmount Maximum taker token amount to fill this
     *     order with.
     */
    public fillOtcOrder(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            expiryAndNonce: BigNumber;
        },
        makerSignature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
        takerTokenFillAmount: BigNumber,
    ): ContractTxFunctionObj<[BigNumber, BigNumber]> {
        const self = (this as any) as IZeroExContract;

        assert.isBigNumber('takerTokenFillAmount', takerTokenFillAmount);
        const functionSignature =
            'fillOtcOrder((address,address,uint128,uint128,address,address,address,uint256),(uint8,uint8,bytes32,bytes32),uint128)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<[BigNumber, BigNumber]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<[BigNumber, BigNumber]>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order, makerSignature, takerTokenFillAmount]);
            },
        };
    }
    /**
     * Fill an OTC order for up to `takerTokenFillAmount` taker tokens.
     * Unwraps bought WETH into ETH before sending it to
     * the taker.
     * @param order The OTC order.
     * @param makerSignature The order signature from the maker.
     * @param takerTokenFillAmount Maximum taker token amount to fill this
     *     order with.
     */
    public fillOtcOrderForEth(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            expiryAndNonce: BigNumber;
        },
        makerSignature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
        takerTokenFillAmount: BigNumber,
    ): ContractTxFunctionObj<[BigNumber, BigNumber]> {
        const self = (this as any) as IZeroExContract;

        assert.isBigNumber('takerTokenFillAmount', takerTokenFillAmount);
        const functionSignature =
            'fillOtcOrderForEth((address,address,uint128,uint128,address,address,address,uint256),(uint8,uint8,bytes32,bytes32),uint128)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<[BigNumber, BigNumber]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<[BigNumber, BigNumber]>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order, makerSignature, takerTokenFillAmount]);
            },
        };
    }
    /**
     * Fill an OTC order whose taker token is WETH for up
     * to `msg.value`.
     * @param order The OTC order.
     * @param makerSignature The order signature from the maker.
     */
    public fillOtcOrderWithEth(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            expiryAndNonce: BigNumber;
        },
        makerSignature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
    ): ContractTxFunctionObj<[BigNumber, BigNumber]> {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'fillOtcOrderWithEth((address,address,uint128,uint128,address,address,address,uint256),(uint8,uint8,bytes32,bytes32))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<[BigNumber, BigNumber]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<[BigNumber, BigNumber]>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order, makerSignature]);
            },
        };
    }
    /**
     * Fill an RFQ order for up to `takerTokenFillAmount` taker tokens.
     * The taker will be the caller.
     * @param order The RFQ order.
     * @param signature The order signature.
     * @param takerTokenFillAmount Maximum taker token amount to fill this order
     *     with.
     */
    public fillRfqOrder(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        },
        signature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
        takerTokenFillAmount: BigNumber,
    ): ContractTxFunctionObj<[BigNumber, BigNumber]> {
        const self = (this as any) as IZeroExContract;

        assert.isBigNumber('takerTokenFillAmount', takerTokenFillAmount);
        const functionSignature =
            'fillRfqOrder((address,address,uint128,uint128,address,address,address,bytes32,uint64,uint256),(uint8,uint8,bytes32,bytes32),uint128)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<[BigNumber, BigNumber]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<[BigNumber, BigNumber]>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order, signature, takerTokenFillAmount]);
            },
        };
    }
    /**
     * Fully fill an OTC order. "Meta-transaction" variant,
     * requires order to be signed by both maker and taker.
     * @param order The OTC order.
     * @param makerSignature The order signature from the maker.
     * @param takerSignature The order signature from the taker.
     */
    public fillTakerSignedOtcOrder(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            expiryAndNonce: BigNumber;
        },
        makerSignature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
        takerSignature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
    ): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'fillTakerSignedOtcOrder((address,address,uint128,uint128,address,address,address,uint256),(uint8,uint8,bytes32,bytes32),(uint8,uint8,bytes32,bytes32))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order, makerSignature, takerSignature]);
            },
        };
    }
    /**
     * Fully fill an OTC order. "Meta-transaction" variant,
     * requires order to be signed by both maker and taker.
     * Unwraps bought WETH into ETH before sending it to
     * the taker.
     * @param order The OTC order.
     * @param makerSignature The order signature from the maker.
     * @param takerSignature The order signature from the taker.
     */
    public fillTakerSignedOtcOrderForEth(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            expiryAndNonce: BigNumber;
        },
        makerSignature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
        takerSignature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
    ): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'fillTakerSignedOtcOrderForEth((address,address,uint128,uint128,address,address,address,uint256),(uint8,uint8,bytes32,bytes32),(uint8,uint8,bytes32,bytes32))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order, makerSignature, takerSignature]);
            },
        };
    }
    /**
     * Get the canonical hash of a limit order.
     * @param order The limit order.
     */
    public getLimitOrderHash(order: {
        makerToken: string;
        takerToken: string;
        makerAmount: BigNumber;
        takerAmount: BigNumber;
        takerTokenFeeAmount: BigNumber;
        maker: string;
        taker: string;
        sender: string;
        feeRecipient: string;
        pool: string;
        expiry: BigNumber;
        salt: BigNumber;
    }): ContractTxFunctionObj<string> {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'getLimitOrderHash((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order]);
            },
        };
    }
    /**
     * Get the order info for a limit order.
     * @param order The limit order.
     */
    public getLimitOrderInfo(order: {
        makerToken: string;
        takerToken: string;
        makerAmount: BigNumber;
        takerAmount: BigNumber;
        takerTokenFeeAmount: BigNumber;
        maker: string;
        taker: string;
        sender: string;
        feeRecipient: string;
        pool: string;
        expiry: BigNumber;
        salt: BigNumber;
    }): ContractTxFunctionObj<{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }> {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'getLimitOrderInfo((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<{
                    orderHash: string;
                    status: number;
                    takerTokenFilledAmount: BigNumber;
                }>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order]);
            },
        };
    }
    /**
     * Get order info, fillable amount, and signature validity for a limit order.
     * Fillable amount is determined using balances and allowances of the maker.
     * @param order The limit order.
     * @param signature The order signature.
     */
    public getLimitOrderRelevantState(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            takerTokenFeeAmount: BigNumber;
            maker: string;
            taker: string;
            sender: string;
            feeRecipient: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        },
        signature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
    ): ContractTxFunctionObj<
        [{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }, BigNumber, boolean]
    > {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'getLimitOrderRelevantState((address,address,uint128,uint128,uint128,address,address,address,address,bytes32,uint64,uint256),(uint8,uint8,bytes32,bytes32))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<[{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }, BigNumber, boolean]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<
                    [{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }, BigNumber, boolean]
                >(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order, signature]);
            },
        };
    }
    /**
     * Get the block at which a meta-transaction has been executed.
     * @param mtx The meta-transaction.
     */
    public getMetaTransactionExecutedBlock(mtx: {
        signer: string;
        sender: string;
        minGasPrice: BigNumber;
        maxGasPrice: BigNumber;
        expirationTimeSeconds: BigNumber;
        salt: BigNumber;
        callData: string;
        value: BigNumber;
        feeToken: string;
        feeAmount: BigNumber;
    }): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'getMetaTransactionExecutedBlock((address,address,uint256,uint256,uint256,uint256,bytes,uint256,address,uint256))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [mtx]);
            },
        };
    }
    /**
     * Get the EIP712 hash of a meta-transaction.
     * @param mtx The meta-transaction.
     */
    public getMetaTransactionHash(mtx: {
        signer: string;
        sender: string;
        minGasPrice: BigNumber;
        maxGasPrice: BigNumber;
        expirationTimeSeconds: BigNumber;
        salt: BigNumber;
        callData: string;
        value: BigNumber;
        feeToken: string;
        feeAmount: BigNumber;
    }): ContractTxFunctionObj<string> {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'getMetaTransactionHash((address,address,uint256,uint256,uint256,uint256,bytes,uint256,address,uint256))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [mtx]);
            },
        };
    }
    /**
     * Get the block at which a meta-transaction hash has been executed.
     * @param mtxHash The meta-transaction hash.
     */
    public getMetaTransactionHashExecutedBlock(mtxHash: string): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isString('mtxHash', mtxHash);
        const functionSignature = 'getMetaTransactionHashExecutedBlock(bytes32)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [mtxHash]);
            },
        };
    }
    /**
     * Get the canonical hash of an OTC order.
     * @param order The OTC order.
     */
    public getOtcOrderHash(order: {
        makerToken: string;
        takerToken: string;
        makerAmount: BigNumber;
        takerAmount: BigNumber;
        maker: string;
        taker: string;
        txOrigin: string;
        expiryAndNonce: BigNumber;
    }): ContractTxFunctionObj<string> {
        const self = (this as any) as IZeroExContract;

        const functionSignature = 'getOtcOrderHash((address,address,uint128,uint128,address,address,address,uint256))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order]);
            },
        };
    }
    /**
     * Get the order info for an OTC order.
     * @param order The OTC order.
     */
    public getOtcOrderInfo(order: {
        makerToken: string;
        takerToken: string;
        makerAmount: BigNumber;
        takerAmount: BigNumber;
        maker: string;
        taker: string;
        txOrigin: string;
        expiryAndNonce: BigNumber;
    }): ContractTxFunctionObj<{ orderHash: string; status: number }> {
        const self = (this as any) as IZeroExContract;

        const functionSignature = 'getOtcOrderInfo((address,address,uint128,uint128,address,address,address,uint256))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<{ orderHash: string; status: number }> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<{ orderHash: string; status: number }>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order]);
            },
        };
    }
    /**
     * Get the protocol fee multiplier. This should be multiplied by the
     * gas price to arrive at the required protocol fee to fill a native order.
     */
    public getProtocolFeeMultiplier(): ContractTxFunctionObj<number> {
        const self = (this as any) as IZeroExContract;
        const functionSignature = 'getProtocolFeeMultiplier()';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<number> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<number>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
    /**
     * Return the optional signer for `transformERC20()` calldata.
     */
    public getQuoteSigner(): ContractTxFunctionObj<string> {
        const self = (this as any) as IZeroExContract;
        const functionSignature = 'getQuoteSigner()';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
    /**
     * Get the canonical hash of an RFQ order.
     * @param order The RFQ order.
     */
    public getRfqOrderHash(order: {
        makerToken: string;
        takerToken: string;
        makerAmount: BigNumber;
        takerAmount: BigNumber;
        maker: string;
        taker: string;
        txOrigin: string;
        pool: string;
        expiry: BigNumber;
        salt: BigNumber;
    }): ContractTxFunctionObj<string> {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'getRfqOrderHash((address,address,uint128,uint128,address,address,address,bytes32,uint64,uint256))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order]);
            },
        };
    }
    /**
     * Get the order info for an RFQ order.
     * @param order The RFQ order.
     */
    public getRfqOrderInfo(order: {
        makerToken: string;
        takerToken: string;
        makerAmount: BigNumber;
        takerAmount: BigNumber;
        maker: string;
        taker: string;
        txOrigin: string;
        pool: string;
        expiry: BigNumber;
        salt: BigNumber;
    }): ContractTxFunctionObj<{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }> {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'getRfqOrderInfo((address,address,uint128,uint128,address,address,address,bytes32,uint64,uint256))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<{
                    orderHash: string;
                    status: number;
                    takerTokenFilledAmount: BigNumber;
                }>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order]);
            },
        };
    }
    /**
     * Get order info, fillable amount, and signature validity for an RFQ order.
     * Fillable amount is determined using balances and allowances of the maker.
     * @param order The RFQ order.
     * @param signature The order signature.
     */
    public getRfqOrderRelevantState(
        order: {
            makerToken: string;
            takerToken: string;
            makerAmount: BigNumber;
            takerAmount: BigNumber;
            maker: string;
            taker: string;
            txOrigin: string;
            pool: string;
            expiry: BigNumber;
            salt: BigNumber;
        },
        signature: { signatureType: number | BigNumber; v: number | BigNumber; r: string; s: string },
    ): ContractTxFunctionObj<
        [{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }, BigNumber, boolean]
    > {
        const self = (this as any) as IZeroExContract;

        const functionSignature =
            'getRfqOrderRelevantState((address,address,uint128,uint128,address,address,address,bytes32,uint64,uint256),(uint8,uint8,bytes32,bytes32))';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(
                callData: Partial<CallData> = {},
                defaultBlock?: BlockParam,
            ): Promise<[{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }, BigNumber, boolean]> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<
                    [{ orderHash: string; status: number; takerTokenFilledAmount: BigNumber }, BigNumber, boolean]
                >(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [order, signature]);
            },
        };
    }
    /**
     * Retrieve an entry in the rollback history for a function.
     * @param selector The function selector.
     * @param idx The index in the rollback history.
     */
    public getRollbackEntryAtIndex(selector: string, idx: BigNumber): ContractTxFunctionObj<string> {
        const self = (this as any) as IZeroExContract;
        assert.isString('selector', selector);
        assert.isBigNumber('idx', idx);
        const functionSignature = 'getRollbackEntryAtIndex(bytes4,uint256)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [selector, idx]);
            },
        };
    }
    /**
     * Retrieve the length of the rollback history for a function.
     * @param selector The function selector.
     */
    public getRollbackLength(selector: string): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isString('selector', selector);
        const functionSignature = 'getRollbackLength(bytes4)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [selector]);
            },
        };
    }
    /**
     * Return the current wallet instance that will serve as the execution
     * context for transformations.
     */
    public getTransformWallet(): ContractTxFunctionObj<string> {
        const self = (this as any) as IZeroExContract;
        const functionSignature = 'getTransformWallet()';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
    /**
     * Return the allowed deployer for transformers.
     */
    public getTransformerDeployer(): ContractTxFunctionObj<string> {
        const self = (this as any) as IZeroExContract;
        const functionSignature = 'getTransformerDeployer()';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
    /**
     * checks if a given address is registered to sign on behalf of a maker address
     * @param maker The maker address encoded in an order (can be a contract)
     * @param signer The address that is providing a signature
     */
    public isValidOrderSigner(maker: string, signer: string): ContractTxFunctionObj<boolean> {
        const self = (this as any) as IZeroExContract;
        assert.isString('maker', maker);
        assert.isString('signer', signer);
        const functionSignature = 'isValidOrderSigner(address,address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<boolean> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<boolean>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [maker.toLowerCase(), signer.toLowerCase()]);
            },
        };
    }
    /**
     * Get the last nonce used for a particular
     * tx.origin address and nonce bucket.
     * @param txOrigin The address.
     * @param nonceBucket The nonce bucket index.
     */
    public lastOtcTxOriginNonce(txOrigin: string, nonceBucket: BigNumber): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isString('txOrigin', txOrigin);
        assert.isBigNumber('nonceBucket', nonceBucket);
        const functionSignature = 'lastOtcTxOriginNonce(address,uint64)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [txOrigin.toLowerCase(), nonceBucket]);
            },
        };
    }
    /**
     * Execute a migration function in the context of the ZeroEx contract.
     * The result of the function being called should be the magic bytes
     * 0x2c64c5ef (`keccack('MIGRATE_SUCCESS')`). Only callable by the owner.
     * The owner will be temporarily set to `address(this)` inside the call.
     * Before returning, the owner will be set to `newOwner`.
     * @param target The migrator contract address.
     * @param data The call data.
     * @param newOwner The address of the new owner.
     */
    public migrate(target: string, data: string, newOwner: string): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isString('target', target);
        assert.isString('data', data);
        assert.isString('newOwner', newOwner);
        const functionSignature = 'migrate(address,bytes,address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    target.toLowerCase(),
                    data,
                    newOwner.toLowerCase(),
                ]);
            },
        };
    }
    /**
     * Sells attached ETH for `outputToken` using the provided
     * calls.
     * @param outputToken The token to buy.
     * @param calls The calls to use to sell the attached ETH.
     * @param minBuyAmount The minimum amount of `outputToken` that        must be
     *     bought for this function to not revert.
     */
    public multiplexBatchSellEthForToken(
        outputToken: string,
        calls: Array<{ id: number | BigNumber; sellAmount: BigNumber; data: string }>,
        minBuyAmount: BigNumber,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isString('outputToken', outputToken);
        assert.isArray('calls', calls);
        assert.isBigNumber('minBuyAmount', minBuyAmount);
        const functionSignature = 'multiplexBatchSellEthForToken(address,(uint8,uint256,bytes)[],uint256)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [outputToken.toLowerCase(), calls, minBuyAmount]);
            },
        };
    }
    /**
     * Sells `sellAmount` of the given `inputToken` for ETH
     * using the provided calls.
     * @param inputToken The token to sell.
     * @param calls The calls to use to sell the input tokens.
     * @param sellAmount The amount of `inputToken` to sell.
     * @param minBuyAmount The minimum amount of ETH that        must be bought for
     *     this function to not revert.
     */
    public multiplexBatchSellTokenForEth(
        inputToken: string,
        calls: Array<{ id: number | BigNumber; sellAmount: BigNumber; data: string }>,
        sellAmount: BigNumber,
        minBuyAmount: BigNumber,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isString('inputToken', inputToken);
        assert.isArray('calls', calls);
        assert.isBigNumber('sellAmount', sellAmount);
        assert.isBigNumber('minBuyAmount', minBuyAmount);
        const functionSignature = 'multiplexBatchSellTokenForEth(address,(uint8,uint256,bytes)[],uint256,uint256)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    inputToken.toLowerCase(),
                    calls,
                    sellAmount,
                    minBuyAmount,
                ]);
            },
        };
    }
    /**
     * Sells `sellAmount` of the given `inputToken` for
     * `outputToken` using the provided calls.
     * @param inputToken The token to sell.
     * @param outputToken The token to buy.
     * @param calls The calls to use to sell the input tokens.
     * @param sellAmount The amount of `inputToken` to sell.
     * @param minBuyAmount The minimum amount of `outputToken`        that must be
     *     bought for this function to not revert.
     */
    public multiplexBatchSellTokenForToken(
        inputToken: string,
        outputToken: string,
        calls: Array<{ id: number | BigNumber; sellAmount: BigNumber; data: string }>,
        sellAmount: BigNumber,
        minBuyAmount: BigNumber,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isString('inputToken', inputToken);
        assert.isString('outputToken', outputToken);
        assert.isArray('calls', calls);
        assert.isBigNumber('sellAmount', sellAmount);
        assert.isBigNumber('minBuyAmount', minBuyAmount);
        const functionSignature =
            'multiplexBatchSellTokenForToken(address,address,(uint8,uint256,bytes)[],uint256,uint256)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    inputToken.toLowerCase(),
                    outputToken.toLowerCase(),
                    calls,
                    sellAmount,
                    minBuyAmount,
                ]);
            },
        };
    }
    /**
     * Sells attached ETH via the given sequence of tokens
     * and calls. `tokens[0]` must be WETH.
     * The last token in `tokens` is the output token that
     * will ultimately be sent to `msg.sender`
     * @param tokens The sequence of tokens to use for the sell,        i.e.
     *     `tokens[i]` will be sold for `tokens[i+1]` via        `calls[i]`.
     * @param calls The sequence of calls to use for the sell.
     * @param minBuyAmount The minimum amount of output tokens that        must be
     *     bought for this function to not revert.
     */
    public multiplexMultiHopSellEthForToken(
        tokens: string[],
        calls: Array<{ id: number | BigNumber; data: string }>,
        minBuyAmount: BigNumber,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('tokens', tokens);
        assert.isArray('calls', calls);
        assert.isBigNumber('minBuyAmount', minBuyAmount);
        const functionSignature = 'multiplexMultiHopSellEthForToken(address[],(uint8,bytes)[],uint256)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [tokens, calls, minBuyAmount]);
            },
        };
    }
    /**
     * Sells `sellAmount` of the input token (`tokens[0]`)
     * for ETH via the given sequence of tokens and calls.
     * The last token in `tokens` must be WETH.
     * @param tokens The sequence of tokens to use for the sell,        i.e.
     *     `tokens[i]` will be sold for `tokens[i+1]` via        `calls[i]`.
     * @param calls The sequence of calls to use for the sell.
     * @param minBuyAmount The minimum amount of ETH that        must be bought for
     *     this function to not revert.
     */
    public multiplexMultiHopSellTokenForEth(
        tokens: string[],
        calls: Array<{ id: number | BigNumber; data: string }>,
        sellAmount: BigNumber,
        minBuyAmount: BigNumber,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('tokens', tokens);
        assert.isArray('calls', calls);
        assert.isBigNumber('sellAmount', sellAmount);
        assert.isBigNumber('minBuyAmount', minBuyAmount);
        const functionSignature = 'multiplexMultiHopSellTokenForEth(address[],(uint8,bytes)[],uint256,uint256)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [tokens, calls, sellAmount, minBuyAmount]);
            },
        };
    }
    /**
     * Sells `sellAmount` of the input token (`tokens[0]`)
     * via the given sequence of tokens and calls.
     * The last token in `tokens` is the output token that
     * will ultimately be sent to `msg.sender`
     * @param tokens The sequence of tokens to use for the sell,        i.e.
     *     `tokens[i]` will be sold for `tokens[i+1]` via        `calls[i]`.
     * @param calls The sequence of calls to use for the sell.
     * @param minBuyAmount The minimum amount of output tokens that        must be
     *     bought for this function to not revert.
     */
    public multiplexMultiHopSellTokenForToken(
        tokens: string[],
        calls: Array<{ id: number | BigNumber; data: string }>,
        sellAmount: BigNumber,
        minBuyAmount: BigNumber,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('tokens', tokens);
        assert.isArray('calls', calls);
        assert.isBigNumber('sellAmount', sellAmount);
        assert.isBigNumber('minBuyAmount', minBuyAmount);
        const functionSignature = 'multiplexMultiHopSellTokenForToken(address[],(uint8,bytes)[],uint256,uint256)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [tokens, calls, sellAmount, minBuyAmount]);
            },
        };
    }
    /**
     * The owner of this contract.
     */
    public owner(): ContractTxFunctionObj<string> {
        const self = (this as any) as IZeroExContract;
        const functionSignature = 'owner()';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, []);
            },
        };
    }
    /**
     * Register a signer who can sign on behalf of msg.sender
     * This allows one to sign on behalf of a contract that calls this function
     * @param signer The address from which you plan to generate signatures
     * @param allowed True to register, false to unregister.
     */
    public registerAllowedOrderSigner(signer: string, allowed: boolean): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isString('signer', signer);
        assert.isBoolean('allowed', allowed);
        const functionSignature = 'registerAllowedOrderSigner(address,bool)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [signer.toLowerCase(), allowed]);
            },
        };
    }
    /**
     * Mark what tx.origin addresses are allowed to fill an order that
     * specifies the message sender as its txOrigin.
     * @param origins An array of origin addresses to update.
     * @param allowed True to register, false to unregister.
     */
    public registerAllowedRfqOrigins(origins: string[], allowed: boolean): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('origins', origins);
        assert.isBoolean('allowed', allowed);
        const functionSignature = 'registerAllowedRfqOrigins(address[],bool)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [origins, allowed]);
            },
        };
    }
    /**
     * Roll back to a prior implementation of a function.
     * @param selector The function selector.
     * @param targetImpl The address of an older implementation of the function.
     */
    public rollback(selector: string, targetImpl: string): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isString('selector', selector);
        assert.isString('targetImpl', targetImpl);
        const functionSignature = 'rollback(bytes4,address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [selector, targetImpl.toLowerCase()]);
            },
        };
    }
    /**
     * Sell attached ETH directly against uniswap v3.
     * @param encodedPath Uniswap-encoded path, where the first token is WETH.
     * @param minBuyAmount Minimum amount of the last token in the path to buy.
     * @param recipient The recipient of the bought tokens. Can be zero for sender.
     */
    public sellEthForTokenToUniswapV3(
        encodedPath: string,
        minBuyAmount: BigNumber,
        recipient: string,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isString('encodedPath', encodedPath);
        assert.isBigNumber('minBuyAmount', minBuyAmount);
        assert.isString('recipient', recipient);
        const functionSignature = 'sellEthForTokenToUniswapV3(bytes,uint256,address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    encodedPath,
                    minBuyAmount,
                    recipient.toLowerCase(),
                ]);
            },
        };
    }
    /**
     * Sells `sellAmount` of `inputToken` to the liquidity provider
     * at the given `provider` address.
     * @param inputToken The token being sold.
     * @param outputToken The token being bought.
     * @param provider The address of the on-chain liquidity provider        to
     *     trade with.
     * @param recipient The recipient of the bought tokens. If equal to
     *     address(0), `msg.sender` is assumed to be the recipient.
     * @param sellAmount The amount of `inputToken` to sell.
     * @param minBuyAmount The minimum acceptable amount of `outputToken` to
     *     buy. Reverts if this amount is not satisfied.
     * @param auxiliaryData Auxiliary data supplied to the `provider` contract.
     */
    public sellToLiquidityProvider(
        inputToken: string,
        outputToken: string,
        provider: string,
        recipient: string,
        sellAmount: BigNumber,
        minBuyAmount: BigNumber,
        auxiliaryData: string,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isString('inputToken', inputToken);
        assert.isString('outputToken', outputToken);
        assert.isString('provider', provider);
        assert.isString('recipient', recipient);
        assert.isBigNumber('sellAmount', sellAmount);
        assert.isBigNumber('minBuyAmount', minBuyAmount);
        assert.isString('auxiliaryData', auxiliaryData);
        const functionSignature = 'sellToLiquidityProvider(address,address,address,address,uint256,uint256,bytes)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    inputToken.toLowerCase(),
                    outputToken.toLowerCase(),
                    provider.toLowerCase(),
                    recipient.toLowerCase(),
                    sellAmount,
                    minBuyAmount,
                    auxiliaryData,
                ]);
            },
        };
    }
    /**
     * Efficiently sell directly to PancakeSwap (and forks).
     * @param tokens Sell path.
     * @param sellAmount of `tokens[0]` Amount to sell.
     * @param minBuyAmount Minimum amount of `tokens[-1]` to buy.
     * @param fork The protocol fork to use.
     */
    public sellToPancakeSwap(
        tokens: string[],
        sellAmount: BigNumber,
        minBuyAmount: BigNumber,
        fork: number | BigNumber,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('tokens', tokens);
        assert.isBigNumber('sellAmount', sellAmount);
        assert.isBigNumber('minBuyAmount', minBuyAmount);
        assert.isNumberOrBigNumber('fork', fork);
        const functionSignature = 'sellToPancakeSwap(address[],uint256,uint256,uint8)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [tokens, sellAmount, minBuyAmount, fork]);
            },
        };
    }
    /**
     * Efficiently sell directly to uniswap/sushiswap.
     * @param tokens Sell path.
     * @param sellAmount of `tokens[0]` Amount to sell.
     * @param minBuyAmount Minimum amount of `tokens[-1]` to buy.
     * @param isSushi Use sushiswap if true.
     */
    public sellToUniswap(
        tokens: string[],
        sellAmount: BigNumber,
        minBuyAmount: BigNumber,
        isSushi: boolean,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('tokens', tokens);
        assert.isBigNumber('sellAmount', sellAmount);
        assert.isBigNumber('minBuyAmount', minBuyAmount);
        assert.isBoolean('isSushi', isSushi);
        const functionSignature = 'sellToUniswap(address[],uint256,uint256,bool)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [tokens, sellAmount, minBuyAmount, isSushi]);
            },
        };
    }
    /**
     * Sell a token for ETH directly against uniswap v3.
     * @param encodedPath Uniswap-encoded path, where the last token is WETH.
     * @param sellAmount amount of the first token in the path to sell.
     * @param minBuyAmount Minimum amount of ETH to buy.
     * @param recipient The recipient of the bought tokens. Can be zero for sender.
     */
    public sellTokenForEthToUniswapV3(
        encodedPath: string,
        sellAmount: BigNumber,
        minBuyAmount: BigNumber,
        recipient: string,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isString('encodedPath', encodedPath);
        assert.isBigNumber('sellAmount', sellAmount);
        assert.isBigNumber('minBuyAmount', minBuyAmount);
        assert.isString('recipient', recipient);
        const functionSignature = 'sellTokenForEthToUniswapV3(bytes,uint256,uint256,address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    encodedPath,
                    sellAmount,
                    minBuyAmount,
                    recipient.toLowerCase(),
                ]);
            },
        };
    }
    /**
     * Sell a token for another token directly against uniswap v3.
     * @param encodedPath Uniswap-encoded path.
     * @param sellAmount amount of the first token in the path to sell.
     * @param minBuyAmount Minimum amount of the last token in the path to buy.
     * @param recipient The recipient of the bought tokens. Can be zero for sender.
     */
    public sellTokenForTokenToUniswapV3(
        encodedPath: string,
        sellAmount: BigNumber,
        minBuyAmount: BigNumber,
        recipient: string,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isString('encodedPath', encodedPath);
        assert.isBigNumber('sellAmount', sellAmount);
        assert.isBigNumber('minBuyAmount', minBuyAmount);
        assert.isString('recipient', recipient);
        const functionSignature = 'sellTokenForTokenToUniswapV3(bytes,uint256,uint256,address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    encodedPath,
                    sellAmount,
                    minBuyAmount,
                    recipient.toLowerCase(),
                ]);
            },
        };
    }
    /**
     * Replace the optional signer for `transformERC20()` calldata.
     * Only callable by the owner.
     * @param quoteSigner The address of the new calldata signer.
     */
    public setQuoteSigner(quoteSigner: string): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isString('quoteSigner', quoteSigner);
        const functionSignature = 'setQuoteSigner(address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [quoteSigner.toLowerCase()]);
            },
        };
    }
    /**
     * Replace the allowed deployer for transformers.
     * Only callable by the owner.
     * @param transformerDeployer The address of the new trusted deployer
     *     for transformers.
     */
    public setTransformerDeployer(transformerDeployer: string): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isString('transformerDeployer', transformerDeployer);
        const functionSignature = 'setTransformerDeployer(address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [transformerDeployer.toLowerCase()]);
            },
        };
    }
    /**
     * Transfers ownership of the contract to a new address.
     * @param newOwner The address that will become the owner.
     */
    public transferOwnership(newOwner: string): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isString('newOwner', newOwner);
        const functionSignature = 'transferOwnership(address)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [newOwner.toLowerCase()]);
            },
        };
    }
    /**
     * Transfers protocol fees from the `FeeCollector` pools into
     * the staking contract.
     * @param poolIds Staking pool IDs
     */
    public transferProtocolFeesForPools(poolIds: string[]): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isArray('poolIds', poolIds);
        const functionSignature = 'transferProtocolFeesForPools(bytes32[])';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [poolIds]);
            },
        };
    }
    /**
     * Executes a series of transformations to convert an ERC20 `inputToken`
     * to an ERC20 `outputToken`.
     * @param inputToken The token being provided by the sender.        If
     *     `0xeee...`, ETH is implied and should be provided with the call.`
     * @param outputToken The token to be acquired by the sender.        `0xeee...`
     *     implies ETH.
     * @param inputTokenAmount The amount of `inputToken` to take from the sender.
     * @param minOutputTokenAmount The minimum amount of `outputToken` the sender
     *          must receive for the entire transformation to succeed.
     * @param transformations The transformations to execute on the token
     *     balance(s)        in sequence.
     */
    public transformERC20(
        inputToken: string,
        outputToken: string,
        inputTokenAmount: BigNumber,
        minOutputTokenAmount: BigNumber,
        transformations: Array<{ deploymentNonce: number | BigNumber; data: string }>,
    ): ContractTxFunctionObj<BigNumber> {
        const self = (this as any) as IZeroExContract;
        assert.isString('inputToken', inputToken);
        assert.isString('outputToken', outputToken);
        assert.isBigNumber('inputTokenAmount', inputTokenAmount);
        assert.isBigNumber('minOutputTokenAmount', minOutputTokenAmount);
        assert.isArray('transformations', transformations);
        const functionSignature = 'transformERC20(address,address,uint256,uint256,(uint32,bytes)[])';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [
                    inputToken.toLowerCase(),
                    outputToken.toLowerCase(),
                    inputTokenAmount,
                    minOutputTokenAmount,
                    transformations,
                ]);
            },
        };
    }
    /**
     * The UniswapV3 pool swap callback which pays the funds requested
     * by the caller/pool to the pool. Can only be called by a valid
     * UniswapV3 pool.
     * @param amount0Delta Token0 amount owed.
     * @param amount1Delta Token1 amount owed.
     * @param data Arbitrary data forwarded from swap() caller. An ABI-encoded
     *       struct of: inputToken, outputToken, fee, payer
     */
    public uniswapV3SwapCallback(
        amount0Delta: BigNumber,
        amount1Delta: BigNumber,
        data: string,
    ): ContractTxFunctionObj<void> {
        const self = (this as any) as IZeroExContract;
        assert.isBigNumber('amount0Delta', amount0Delta);
        assert.isBigNumber('amount1Delta', amount1Delta);
        assert.isString('data', data);
        const functionSignature = 'uniswapV3SwapCallback(int256,int256,bytes)';

        return {
            async sendTransactionAsync(
                txData?: Partial<TxData> | undefined,
                opts: SendTransactionOpts = { shouldValidate: true },
            ): Promise<string> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
                    { data: this.getABIEncodedTransactionData(), ...txData },
                    this.estimateGasAsync.bind(this),
                );
                if (opts.shouldValidate !== false) {
                    await this.callAsync(txDataWithDefaults);
                }
                return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
            },
            awaitTransactionSuccessAsync(
                txData?: Partial<TxData>,
                opts: AwaitTransactionSuccessOpts = { shouldValidate: true },
            ): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
                return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
            },
            async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
            },
            async createAccessListAsync(
                txData?: Partial<TxData> | undefined,
                defaultBlock?: BlockParam,
            ): Promise<TxAccessListWithGas> {
                const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
                    data: this.getABIEncodedTransactionData(),
                    ...txData,
                });
                return self._web3Wrapper.createAccessListAsync(txDataWithDefaults, defaultBlock);
            },
            async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
                BaseContract._assertCallParams(callData, defaultBlock);
                const rawCallResult = await self._performCallAsync(
                    { data: this.getABIEncodedTransactionData(), ...callData },
                    defaultBlock,
                );
                const abiEncoder = self._lookupAbiEncoder(functionSignature);
                BaseContract._throwIfUnexpectedEmptyCallResult(rawCallResult, abiEncoder);
                return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
            },
            getABIEncodedTransactionData(): string {
                return self._strictEncodeArguments(functionSignature, [amount0Delta, amount1Delta, data]);
            },
        };
    }

    /**
     * Subscribe to an event type emitted by the IZeroEx contract.
     * @param eventName The IZeroEx contract event you would like to subscribe to.
     * @param indexFilterValues An object where the keys are indexed args returned by the event and
     * the value is the value you are interested in. E.g `{maker: aUserAddressHex}`
     * @param callback Callback that gets called when a log is added/removed
     * @param isVerbose Enable verbose subscription warnings (e.g recoverable network issues encountered)
     * @return Subscription token used later to unsubscribe
     */
    public subscribe<ArgsType extends IZeroExEventArgs>(
        eventName: IZeroExEvents,
        indexFilterValues: IndexedFilterValues,
        callback: EventCallback<ArgsType>,
        isVerbose: boolean = false,
        blockPollingIntervalMs?: number,
    ): string {
        assert.doesBelongToStringEnum('eventName', eventName, IZeroExEvents);
        assert.doesConformToSchema('indexFilterValues', indexFilterValues, schemas.indexFilterValuesSchema);
        assert.isFunction('callback', callback);
        const subscriptionToken = this._subscriptionManager.subscribe<ArgsType>(
            this.address,
            eventName,
            indexFilterValues,
            IZeroExContract.ABI(),
            callback,
            isVerbose,
            blockPollingIntervalMs,
        );
        return subscriptionToken;
    }

    /**
     * Cancel a subscription
     * @param subscriptionToken Subscription token returned by `subscribe()`
     */
    public unsubscribe(subscriptionToken: string): void {
        this._subscriptionManager.unsubscribe(subscriptionToken);
    }

    /**
     * Cancels all existing subscriptions
     */
    public unsubscribeAll(): void {
        this._subscriptionManager.unsubscribeAll();
    }

    /**
     * Gets historical logs without creating a subscription
     * @param eventName The IZeroEx contract event you would like to subscribe to.
     * @param blockRange Block range to get logs from.
     * @param indexFilterValues An object where the keys are indexed args returned by the event and
     * the value is the value you are interested in. E.g `{_from: aUserAddressHex}`
     * @return Array of logs that match the parameters
     */
    public async getLogsAsync<ArgsType extends IZeroExEventArgs>(
        eventName: IZeroExEvents,
        blockRange: BlockRange,
        indexFilterValues: IndexedFilterValues,
    ): Promise<Array<LogWithDecodedArgs<ArgsType>>> {
        assert.doesBelongToStringEnum('eventName', eventName, IZeroExEvents);
        assert.doesConformToSchema('blockRange', blockRange, schemas.blockRangeSchema);
        assert.doesConformToSchema('indexFilterValues', indexFilterValues, schemas.indexFilterValuesSchema);
        const logs = await this._subscriptionManager.getLogsAsync<ArgsType>(
            this.address,
            eventName,
            blockRange,
            indexFilterValues,
            IZeroExContract.ABI(),
        );
        return logs;
    }

    constructor(
        address: string,
        supportedProvider: SupportedProvider,
        txDefaults?: Partial<TxData>,
        logDecodeDependencies?: { [contractName: string]: ContractAbi },
        deployedBytecode: string | undefined = IZeroExContract.deployedBytecode,
        encoderOverrides?: Partial<EncoderOverrides>,
    ) {
        super(
            'IZeroEx',
            IZeroExContract.ABI(),
            address,
            supportedProvider,
            txDefaults,
            logDecodeDependencies,
            deployedBytecode,
            encoderOverrides,
        );
        classUtils.bindAll(this, ['_abiEncoderByFunctionSignature', 'address', '_web3Wrapper']);
        this._subscriptionManager = new SubscriptionManager<IZeroExEventArgs, IZeroExEvents>(
            IZeroExContract.ABI(),
            this._web3Wrapper,
        );
        IZeroExContract.ABI().forEach((item, index) => {
            if (item.type === 'function') {
                const methodAbi = item as MethodAbi;
                this._methodABIIndex[methodAbi.name] = index;
            }
        });
    }
}

// tslint:disable:max-file-line-count
// tslint:enable:no-unbound-method no-parameter-reassignment no-consecutive-blank-lines ordered-imports align
// tslint:enable:trailing-comma whitespace no-trailing-whitespace
