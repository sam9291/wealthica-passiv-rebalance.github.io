import React, { useState, useEffect } from "react";
import "./App.css";
import {
  Position,
  wealthica,
  WealthicaAddonOptions,
  Institution,
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

const Row: React.FC<RowProps> = (props) => {
  const quantity =
    props.positions.find((x) => x.security.symbol === props.component.symbol)
      ?.quantity || 0;
  const rebalanceAction = props.actions.find(
    (x) => x.symbol === props.component.symbol
  );

  let actionQuantity = 0;
  if (rebalanceAction) {
    actionQuantity = rebalanceAction.units;
    if (rebalanceAction.action === "SELL") {
      actionQuantity *= -1;
    }
  }
  return (
    <tr>
      <td>{props.component.symbol}</td>
      <td>{rebalanceAction?.price || "-"}</td>
      <td>{props.component.percentOfPortfolio}</td>
      <td>{quantity}</td>
      <td>{actionQuantity || ""}</td>
      <td>{quantity + actionQuantity}</td>
    </tr>
  );
};

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [generateBuyOnly, setGenerateBuyOnly] = useState(false);
  const [options, setOptions] = useState<WealthicaAddonOptions>();
  const [targetRepository, setTargetRepository] = useState<
    PortfolioTargetRepository
  >();
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioTarget>();
  const [positions, setPositions] = useState<Position[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [rebalanceAction, setRebalanceAction] = useState<RebalanceAction[]>([]);

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);

      wealthica.addon.on("init", (options) => {
        setOptions(options);
        console.log("init", options);
      });

      wealthica.addon.on("update", (options) => {
        // Filters have been updated and Dashboard is passing in updated options
        setOptions((prev) => ({
          ...prev,
          ...options,
        }));
        console.log("update", options);
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

        const institutionsResults = await fetchInstitutions();
        setInstitutions(institutionsResults);
      }
    };

    refreshPositions();
  }, [options]);

  const select = async (portfolio: PortfolioTarget) => {
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

    const result = await fetchRebalanceActions({
      buy_only: generateBuyOnly,
      positions: positions.map((x) => ({
        symbol: x.security.symbol,
        units: x.quantity,
      })),
      targets: portfolio.components.map((x) => ({
        percent: x.percentOfPortfolio,
        symbol: x.symbol,
      })),
      balances: distinctCurrencies.map((currency) =>
        getBalancePerCurrency(currency)
      ),
    });
    setRebalanceAction(result);
    setSelectedPortfolio(portfolio);
  };

  return (
    <div className="App">
      <h1>Positions:</h1>
      <ul>
        {positions.map((position) => (
          <li>{`${position.security.symbol}: ${position.quantity}`}</li>
        ))}
      </ul>
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

      {selectedPortfolio && positions && (
        <>
          <h1>{selectedPortfolio.portfolioName}</h1>
          <table>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Target</th>
              <th>Current Quantity</th>
              <th>Buy/Sell</th>
              <th>Result</th>
            </tr>
            {selectedPortfolio.components.map((c) => (
              <Row
                component={c}
                positions={positions}
                actions={rebalanceAction}
              />
            ))}
          </table>
        </>
      )}
    </div>
  );
};

export default App;