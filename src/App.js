import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
} from "recharts";
import BarChartIcon from "@mui/icons-material/BarChart";
import TableChartIcon from "@mui/icons-material/TableChart";
import "./App.css";

function App() {
  const [initialAmount, setInitialAmount] = useState(5000);
  const [contributions, setContributions] = useState(150);
  const [rateOfReturn, setRateOfReturn] = useState(4);
  const [yearsOfGrowth, setYearsOfGrowth] = useState(10);
  const [frequency, setFrequency] = useState("monthly");
  const [chartData, setChartData] = useState([]);

  const [viewMode, setViewMode] = useState("chart");

  const error = console.error;
  console.error = (...args) => {
    if (/defaultProps/.test(args[0])) return;
    error(...args);
  };
  const calculateCompoundInterest = useCallback(() => {
    let balance = initialAmount;
    let totalContributions = initialAmount;
    let totalInterest = 0;
    const data = [];

    for (let year = 1; year <= yearsOfGrowth; year++) {
      const startingBalance = balance;
      const yearlyContribution =
        frequency === "monthly" ? contributions * 12 : contributions;
      totalContributions += yearlyContribution;

      const interestEarned = balance * (rateOfReturn / 100);
      totalInterest += interestEarned;
      balance = balance + yearlyContribution + interestEarned;

      data.push({
        year,
        initialAmount: Math.round(initialAmount),
        startingBalance: Math.round(startingBalance),
        contributions: Math.round(totalContributions - initialAmount),
        interest: Math.round(totalInterest),
        balance: Math.round(balance),
      });
    }

    setChartData(data);
  }, [initialAmount, contributions, rateOfReturn, yearsOfGrowth, frequency]);

  useEffect(() => {
    calculateCompoundInterest();
  }, [calculateCompoundInterest]);

  const handleIncrement = (setter, value, step = 1) => {
    setter((prev) => Math.round((prev + step) * 100) / 100);
  };

  const handleDecrement = (setter, value, step = 1) => {
    setter((prev) => Math.max(0, Math.round((prev - step) * 100) / 100));
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "chart" ? "table" : "chart");
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const totalBalance = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="custom-tooltip">
          <p>{`Year: ${label}`}</p>
          <p
            style={{ color: "#000000" }}
          >{`Total Balance: $${totalBalance.toLocaleString()}`}</p>
          {payload.map((entry) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {`${entry.name}: $${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => (
    <AreaChart width={600} height={300} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="year" />
      <YAxis />
      <ChartTooltip content={<CustomTooltip />} />
      <Legend />
      <Area
        type="monotone"
        dataKey="initialAmount"
        name="Initial Amount"
        stackId="1"
        fill="#8884d8"
        stroke="#8884d8"
      />
      <Area
        type="monotone"
        dataKey="contributions"
        name="Total Contributions"
        stackId="1"
        fill="#82ca9d"
        stroke="#82ca9d"
      />
      <Area
        type="monotone"
        dataKey="interest"
        name="Total Interest Earned"
        stackId="1"
        fill="#ffc658"
        stroke="#ffc658"
      />
    </AreaChart>
  );

  const renderTable = () => {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      return (
        <table className="compound-interest-table mobile">
          <thead>
            <tr>
              <th>YEAR</th>
              <th>STARTING BALANCE</th>
              <th>TOTAL BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.year}>
                <td>{row.year}</td>
                <td>${row.startingBalance.toLocaleString()}</td>
                <td>${row.balance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return (
      <table className="compound-interest-table">
        <thead>
          <tr>
            <th>YEAR</th>
            <th>STARTING BALANCE</th>
            <th>ANNUAL CONTRIBUTIONS</th>
            <th>CUMULATIVE CONTRIBUTIONS</th>
            <th>INTEREST EARNED</th>
            <th>CUMULATIVE INTEREST</th>
            <th>TOTAL BALANCE</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((row) => (
            <tr key={row.year}>
              <td>{row.year}</td>
              <td>${row.startingBalance.toLocaleString()}</td>
              <td>
                $
                {(
                  row.contributions -
                  (chartData[row.year - 2]?.contributions || 0)
                ).toLocaleString()}
              </td>
              <td>${row.contributions.toLocaleString()}</td>
              <td>
                $
                {(
                  row.interest - (chartData[row.year - 2]?.interest || 0)
                ).toLocaleString()}
              </td>
              <td>${row.interest.toLocaleString()}</td>
              <td>${row.balance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="App">
      <h1 className="highlight-color">Compound Interest Calculator</h1>
      <p className="subtitle">
        Enter your initial amount, contributions, rate of return and years of
        growth to see how your amount increases over time.
      </p>
      <div className="calculator">
        <div className="inputs">
          <div className="input-group">
            <Tooltip title="The amount you start with">
              <label className="highlight-color">Initial Amount</label>
            </Tooltip>
            <div className="input-with-buttons">
              <button
                onClick={() =>
                  handleDecrement(setInitialAmount, initialAmount, 100)
                }
              >
                -
              </button>
              <TextField
                type="text"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
              />
              <button
                onClick={() =>
                  handleIncrement(setInitialAmount, initialAmount, 100)
                }
              >
                +
              </button>
            </div>
          </div>
          <div className="input-group">
            <Tooltip title="How much you add to your investment">
              <label className="highlight-color">Contributions</label>
            </Tooltip>
            <div className="input-with-buttons">
              <button
                onClick={() =>
                  handleDecrement(setContributions, contributions, 10)
                }
              >
                -
              </button>
              <TextField
                type="text"
                value={contributions}
                onChange={(e) => setContributions(Number(e.target.value))}
              />
              <button
                onClick={() =>
                  handleIncrement(setContributions, contributions, 10)
                }
              >
                +
              </button>
            </div>
          </div>
          <RadioGroup
            row
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="radio-group"
          >
            <FormControlLabel
              value="monthly"
              control={<Radio />}
              label="Monthly"
            />
            <FormControlLabel
              value="annually"
              control={<Radio />}
              label="Annually"
            />
          </RadioGroup>
          <div className="input-group">
            <Tooltip title="Annual rate of return">
              <label className="highlight-color">Rate of Return</label>
            </Tooltip>
            <div className="input-with-buttons">
              <button
                onClick={() =>
                  handleDecrement(setRateOfReturn, rateOfReturn, 0.1)
                }
              >
                -
              </button>
              <TextField
                type="text"
                value={rateOfReturn}
                onChange={(e) => setRateOfReturn(Number(e.target.value))}
              />
              <button
                onClick={() =>
                  handleIncrement(setRateOfReturn, rateOfReturn, 0.1)
                }
              >
                +
              </button>
            </div>
          </div>
          <div className="input-group">
            <Tooltip title="Number of years to grow">
              <label className="highlight-color">Years of Growth</label>
            </Tooltip>
            <div className="input-with-buttons">
              <button
                onClick={() => handleDecrement(setYearsOfGrowth, yearsOfGrowth)}
              >
                -
              </button>
              <TextField
                type="text"
                value={yearsOfGrowth}
                onChange={(e) => setYearsOfGrowth(Number(e.target.value))}
              />
              <button
                onClick={() => handleIncrement(setYearsOfGrowth, yearsOfGrowth)}
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="divider"></div>
        <div className="results">
          <div className="results-header">
            <h2 className="highlight-color">
              After {yearsOfGrowth} years, your total balance is $
              {chartData[chartData.length - 1]?.balance.toLocaleString()}
            </h2>
            <div className="view-toggle">
              <IconButton
                onClick={toggleViewMode}
                color={viewMode === "chart" ? "primary" : "default"}
              >
                <BarChartIcon />
              </IconButton>
              <IconButton
                onClick={toggleViewMode}
                color={viewMode === "table" ? "primary" : "default"}
              >
                <TableChartIcon />
              </IconButton>
            </div>
          </div>
          {viewMode === "chart" ? renderChart() : renderTable()}
        </div>
      </div>
    </div>
  );
}

export default App;
