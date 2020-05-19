import React, { useState, useEffect } from "react";
import "./App.css";
import {
  Position,
  wealthica,
  WealthicaAddonOptions,
  Institution,
  Security,
} from "./environment/wealthica-api";
import {
  fetchPositions,
  fetchTargets,
  fetchRebalanceActions,
  fetchInstitutions,
} from "./fetchers/fetchers";
import {
  PortfolioTargetRepository,
  PortfolioTarget,
  SymbolTarget,
  RebalanceAction,
} from "./environment/passiv-api";

const buttonStyle = { margin: 8 };

type RowProps = {
  component: SymbolTarget;
  positions: Position[];
  actions: RebalanceAction[];
};

const getSymbol = (security: Security, category: string) => {
  const suffix = category === "Canadian Stocks" ? ".TO" : "";

  return `${security.symbol}${suffix}`;
};

const Row: React.FC<RowProps> = (props) => {
  const quantity =
    props.positions.find(
      (x) => getSymbol(x.security, x.category) === props.component.symbol
    )?.quantity || 0;
  const rebalanceAction = props.actions.find(
    (x) => x.symbol === props.component.symbol
  );

  let actionQuantity = 0;
  if (rebalanceAction) {
    actionQuantity = rebalanceAction.units;
    if (rebalanceAction.action === "SELL") {
      actionQuantity = actionQuantity * -1;
    }
  }
  return (
    <tr>
      <td>{props.component.symbol}</td>
      <td>{rebalanceAction?.price || "-"}</td>
      <td>{props.component.percentOfPortfolio}</td>
      <td>{quantity}</td>
      <td>{rebalanceAction?.action || ""}</td>
      <td>{actionQuantity || ""}</td>
      <td>{quantity + actionQuantity}</td>
    </tr>
  );
};

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [generateBuyOnly, setGenerateBuyOnly] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [options, setOptions] = useState<WealthicaAddonOptions>();
  const [targetRepository, setTargetRepository] = useState<
    PortfolioTargetRepository
  >();
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioTarget>();
  const [positions, setPositions] = useState<Position[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [rebalanceActions, setRebalanceActions] = useState<RebalanceAction[]>(
    []
  );
  const distinctCurrencies = Object.keys(
    institutions
      .flatMap((x) => x.investments)
      .map((x) => x.currency)
      .reduce(
        (map, currency) => ({
          ...map,
          [currency]: 1,
        }),
        {}
      )
  );

  const getBalancePerCurrency = (currency: string) => ({
    currency: currency,
    amount: institutions
      .flatMap((x) => x.investments.filter((i) => i.currency === currency))
      .reduce((total, investment) => total + investment.cash, 0),
  });

  const cashBalances = distinctCurrencies.map((currency) =>
    getBalancePerCurrency(currency)
  );

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);

      wealthica.addon.on("init", (options) => {
        setOptions(options);
      });

      wealthica.addon.on("update", (options) => {
        setOptions((prev) => ({
          ...prev,
          ...options,
        }));
      });
    }
  }, [isInitialized]);

  useEffect(() => {
    const refreshPositions = async () => {
      if (options) {
        const result = await fetchPositions(options);
        setPositions(result);

        const targetResults = await fetchTargets();
        setTargetRepository(targetResults);

        const institutionsResults = await fetchInstitutions(options);
        setInstitutions(institutionsResults);
      }
    };

    refreshPositions();
  }, [options]);

  const select = async (portfolio: PortfolioTarget) => {
    setIsFetchingData(true);
    const result = await fetchRebalanceActions({
      buy_only: generateBuyOnly,
      positions: positions.map((x) => ({
        symbol: getSymbol(x.security, x.category),
        units: x.quantity,
      })),
      targets: portfolio.components.map((x) => ({
        symbol: x.symbol,
        percent: x.percentOfPortfolio * 100,
      })),
      balances: cashBalances,
    });
    setRebalanceActions(result);
    setSelectedPortfolio(portfolio);
    setIsFetchingData(false);
  };

  return (
    <div className="App">
      <h1>Positions:</h1>
      <table>
        <tr>
          <th>Symbol</th>
          <th>Quantity</th>
        </tr>
        {positions.map((position) => (
          <tr>
            <td>{getSymbol(position.security, position.category)}</td>
            <td>{position.quantity}</td>
          </tr>
        ))}
      </table>
      <h1>Cash Balance</h1>
      <table>
        <tr>
          <th>Currency</th>
          <th>Balance</th>
        </tr>
        {cashBalances.map((x) => (
          <tr>
            <td>{x.currency}</td>
            <td>{x.amount}</td>
          </tr>
        ))}
      </table>
      <h1>Targets:</h1>
      <div>
        {targetRepository && (
          <>
            <span>Buy only</span>
            <input
              type="checkbox"
              checked={generateBuyOnly}
              onClick={() => setGenerateBuyOnly(!generateBuyOnly)}
            />
            {targetRepository.portfolios.map((p) => (
              <button onClick={() => select(p)} style={buttonStyle}>
                {p.portfolioName}
              </button>
            ))}
          </>
        )}
      </div>

      {isFetchingData && <h2>Loading...</h2>}

      {selectedPortfolio && positions && (
        <>
          <h1>{selectedPortfolio.portfolioName}</h1>
          <table>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Target</th>
              <th>Current Quantity</th>
              <th>Action</th>
              <th>Buy/Sell</th>
              <th>Result</th>
            </tr>
            {selectedPortfolio.components.map((c) => (
              <Row
                component={c}
                positions={positions}
                actions={rebalanceActions}
              />
            ))}
          </table>
        </>
      )}
    </div>
  );
};

export default App;
