import Web3 from "web3";
const bscTestnet = `https://speedy-nodes-nyc.moralis.io/11ed355a9e5af834c4ec415e/bsc/testnet`;
const bscMainnet = `https://data-seed-prebsc-1-s1.binance.org:8545/`;
const web3 = new Web3(new Web3.providers.HttpProvider(bscMainnet));
const allTransactions = [];
let lastest = checkedBlockNum;

const getTx = async (tx) => await web3.eth.getTransaction(tx);

const getLastestTransactions = async () => {
	try {
		// 최신 블록번호가 마지막에 확인한 블록번호보다 크다면,
		// 그 차이만큼 블록을 조회하기 위해 범위 업데이트
		await web3.eth.getBlockNumber((err, result) => {
			if (err) throw err;
			if (result > lastest) {
				lastest = result;
			}
		});

		if (checkedBlockNum === lastest) {
			return [];
		} else {
			// 가장 마지막에 확인한 블록의 다음 블록부터 가장 최신 블록까지의 모든 트랜잭션 조회
			for (let i = checkedBlockNum + 1; i <= lastest; i++) {
				const block = await web3.eth.getBlock(i);

				// 트랜잭션 해시로 모든 트랜잭션 조회
				for (let tx of block.transactions) {
					allTransactions.push(getTx(tx));
				}
			}

			// 모든 트랜잭션 중에서, 조건에 부합하는 트랜잭션을 배열로 리턴(Promise)
			return Promise.all(allTransactions)
				.then((data) => {
					const result = [];
					for (let tx of data) {
						if (tx.from === contractAddress || tx.to === contractAddress) {
							result.push(tx);
						}
					}
					return result;
				})
				.then((data) => {
					// 가장 마지막에 확인한 블록번호 저장
					fs.writeFileSync(
						path.join(basePath, '/utils/blockNumber'),
						String(lastest),
					);
					return data;
				});
		}
	} catch (err) {
		console.log(err);
	}
};