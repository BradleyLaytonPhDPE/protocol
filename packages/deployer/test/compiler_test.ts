import * as chai from 'chai';
import 'mocha';

import { Compiler } from '../src/compiler';
import { fsWrapper } from '../src/utils/fs_wrapper';
import { CompilerOptions, ContractArtifact, ContractNetworkData, DoneCallback } from '../src/utils/types';

import { exchange_binary } from './fixtures/exchange_bin';
import { constants } from './util/constants';

const expect = chai.expect;

describe('#Compiler', () => {
    const artifactsDir = `${__dirname}/fixtures/artifacts`;
    const contractsDir = `${__dirname}/fixtures/contracts`;
    const exchangeArtifactPath = `${artifactsDir}/Exchange.json`;
    const compilerOpts: CompilerOptions = {
        artifactsDir,
        contractsDir,
        networkId: constants.networkId,
        optimizerEnabled: constants.optimizerEnabled,
        specifiedContracts: new Set(constants.specifiedContracts),
    };
    const compiler = new Compiler(compilerOpts);
    beforeEach(function(done: DoneCallback) {
        this.timeout(constants.timeoutMs);
        (async () => {
            if (fsWrapper.doesPathExistSync(exchangeArtifactPath)) {
                await fsWrapper.removeFileAsync(exchangeArtifactPath);
            }
            await compiler.compileAsync();
            done();
        })().catch(done);
    });
    it('should create an Exchange artifact with the correct unlinked binary', async () => {
        const opts = {
            encoding: 'utf8',
        };
        const exchangeArtifactString = await fsWrapper.readFileAsync(exchangeArtifactPath, opts);
        const exchangeArtifact: ContractArtifact = JSON.parse(exchangeArtifactString);
        const exchangeContractData: ContractNetworkData = exchangeArtifact.networks[constants.networkId];
        // The last 43 bytes of the binaries are metadata which may not be equivalent
        const unlinkedBinaryWithoutMetadata = exchangeContractData.bytecode.slice(0, -86);
        const exchangeBinaryWithoutMetadata = exchange_binary.slice(0, -86);
        expect(unlinkedBinaryWithoutMetadata).to.equal(exchangeBinaryWithoutMetadata);
    });
});
