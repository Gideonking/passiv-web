import { createSelector } from 'reselect';
import ms from 'milliseconds';
import {
  selectLoggedIn,
  selectAppTime,
  selectCurrencyRates,
  selectRouter,
  selectState,
  selectSettings,
} from './index';
import {
  selectAccounts,
  selectAccountBalances,
  selectCurrentAccountBalances,
  selectAccountPositions,
  selectCurrentAccountPositions,
  selectCurrentAccountPositionsError,
  selectCashRestrictions,
} from './accounts';
import { selectIsEditMode } from './router';
import shouldUpdate from '../reactors/should-update';
import { AppState } from '../store';
import {
  CalculatedTrades,
  GroupInfoData,
  Settings,
  Balance,
  TargetPosition,
} from '../types/groupInfo';
import { Authorization } from '../types/authorization';
import { createMatchSelector, RouterState } from 'connected-react-router';
import { GroupData } from '../types/group';
import { SimpleState } from '../types/common';
import { CurrencyRate } from '../types/currencyRate';
import { SimpleListState } from '../reducers/simpleList';
import { Currency } from '../types/currency';
import { Position, Account } from '../types/account';
import { selectCurrencies } from '../selectors/currencies';

export const selectGroupsRaw = (state: AppState) => state.groups;

export const selectGroupInfo = (state: AppState) => state.groupInfo;

export const selectGroups = createSelector(
  selectGroupsRaw,
  selectGroupInfo,
  selectAccounts,
  (rawGroups, groupInfo, accounts) => {
    if (rawGroups.data) {
      return rawGroups.data.map((group) => {
        const groupWithRebalance = group;
        if (groupInfo[group.id] && groupInfo[group.id].data) {
          if (
            groupInfo[group.id].data!.settings.target_initialized &&
            groupInfo[group.id].data!.asset_classes_details &&
            groupInfo[group.id].data!.asset_classes_details.length > 0
          ) {
            groupWithRebalance.setupComplete = true;
          } else {
            groupWithRebalance.setupComplete = false;
          }
          groupWithRebalance.rebalance = !!(
            groupInfo[group.id].data!.calculated_trades &&
            groupInfo[group.id].data!.calculated_trades.trades &&
            groupInfo[group.id].data!.calculated_trades.trades.length > 0
          );
        }

        if (groupInfo[group.id]) {
          groupWithRebalance.loading = groupInfo[group.id].loading;
        }

        groupWithRebalance.hasAccounts = false;
        groupWithRebalance.accounts = [];
        if (accounts) {
          let groupAccounts = accounts.filter(
            (account) => account.portfolio_group === group.id,
          );

          if (groupAccounts.length > 0 && accounts) {
            groupWithRebalance.hasAccounts = true;
          }

          groupWithRebalance.accounts = groupAccounts;
        }

        return groupWithRebalance;
      });
    }
    return null;
  },
);

export const selectGroupsNeedData = createSelector(
  selectLoggedIn,
  selectGroupsRaw,
  selectAppTime,
  selectIsEditMode,
  (loggedIn, rawGroups, time, edit) => {
    if (!loggedIn || edit) {
      return false;
    }
    return shouldUpdate(rawGroups, {
      staleTime: ms.minutes(10),
      now: time,
    });
  },
);

export const selectGroupInfoNeedsData = createSelector<
  AppState,
  boolean,
  SimpleState<GroupData[]>,
  SimpleListState<GroupInfoData>,
  number,
  boolean,
  boolean
>(
  selectLoggedIn,
  selectGroupsRaw,
  selectGroupInfo,
  selectAppTime,
  selectIsEditMode,
  (loggedIn, rawGroups, groupInfo, time, edit) => {
    if (!loggedIn || edit) {
      return false;
    }

    let needsData = false;

    if (rawGroups && rawGroups.data) {
      needsData =
        rawGroups &&
        rawGroups!.data!.some((group) => {
          return (
            !groupInfo[group.id].loading &&
            groupInfo[group.id].data === undefined
          );
        });
    }

    return needsData;
  },
);

export const selectCurrentGroupId = createSelector<
  AppState,
  RouterState,
  string | null
>(selectRouter, (router) => {
  let groupId = null;
  if (
    router &&
    router.location &&
    router.location.pathname &&
    router.location.pathname.split('/').length >= 4
  ) {
    groupId = router.location.pathname.split('/')[3];
  }
  return groupId;
});

export const selectCurrentGroupInfo = createSelector(
  selectCurrentGroupId,
  selectGroupInfo,
  (groupId, groupInfo) => {
    if (groupId && groupInfo[groupId] && groupInfo[groupId].data) {
      return groupInfo[groupId].data;
    }
    return null;
  },
);

export const selectCurrentGroupInfoLoading = createSelector(
  selectCurrentGroupId,
  selectGroupInfo,
  (groupId, groupInfo) => {
    if (groupId && groupInfo[groupId]) {
      return groupInfo[groupId].loading;
    }
    return true;
  },
);

export const selectCurrentGroupInfoError = createSelector(
  selectCurrentGroupInfo,
  (groupInfo) => {
    if (groupInfo) {
      return groupInfo.error;
    }
    return null;
  },
);

export const selectGroupsLoading = createSelector(
  selectGroupsRaw,
  (rawGroups) => rawGroups.loading,
);

export const selectCurrentGroupAccuracy = createSelector<
  AppState,
  string | null,
  SimpleListState<GroupInfoData>,
  number | null
>(selectCurrentGroupId, selectGroupInfo, (groupId, groupInfo) => {
  let accuracy = null;
  if (
    groupId &&
    groupInfo &&
    groupInfo[groupId] &&
    groupInfo[groupId].data &&
    groupInfo[groupId].data!.accuracy >= 0
  ) {
    accuracy = groupInfo[groupId].data!.accuracy;
  }
  return accuracy;
});

export const selectCurrentGroupSettings = createSelector<
  AppState,
  string | null,
  SimpleListState<GroupInfoData>,
  Settings | null
>(selectCurrentGroupId, selectGroupInfo, (groupId, groupInfo) => {
  let settings = null;
  if (
    groupId &&
    groupInfo &&
    groupInfo[groupId] &&
    groupInfo[groupId].data &&
    groupInfo[groupId].data!.settings
  ) {
    settings = groupInfo[groupId].data!.settings;
  }
  return settings;
});

export const selectCurrentGroupTargetInitialized = createSelector<
  AppState,
  Settings | null,
  boolean
>(selectCurrentGroupSettings, (groupSettings) => {
  let targetInitialized = false;
  if (groupSettings && groupSettings.target_initialized) {
    targetInitialized = groupSettings.target_initialized;
  }
  return targetInitialized;
});

export const selectCurrentGroupBalances = createSelector<
  AppState,
  string | null,
  SimpleListState<GroupInfoData>,
  Balance[] | null
>(selectCurrentGroupId, selectGroupInfo, (groupId, groupInfo) => {
  let balances = null;
  if (
    groupId &&
    groupInfo &&
    groupInfo[groupId] &&
    groupInfo[groupId].data &&
    groupInfo[groupId].data!.balances
  ) {
    balances = groupInfo[groupId].data!.balances;
  }
  return balances;
});

export const selectPreferredCurrency = createSelector(
  selectCurrencies,
  selectCurrentGroupSettings,
  (currencies, settings) => {
    if (!currencies) {
      return null;
    }
    if (!settings) {
      return null;
    }
    const preferredCurrency = currencies.find(
      (currency) => currency.id === settings.preferred_currency,
    );
    if (!preferredCurrency) {
      return null;
    }
    return preferredCurrency;
  },
);

export const selectGlobalPreferredCurrency = createSelector(
  selectCurrencies,
  selectSettings,
  (currencies, settings) => {
    if (!currencies) {
      return null;
    }
    if (!settings) {
      return null;
    }
    const preferredCurrency = currencies.find(
      (currency) => currency.id === settings.preferred_currency,
    );
    if (!preferredCurrency) {
      return null;
    }
    return preferredCurrency;
  },
);

export const selectCurrentGroupCash = createSelector<
  AppState,
  Balance[] | null,
  Currency[] | null,
  CurrencyRate[] | null,
  Currency | null,
  number | null
>(
  selectCurrentGroupBalances,
  selectCurrencies,
  selectCurrencyRates,
  selectPreferredCurrency,
  (balances, currencies, rates, preferredCurrency) => {
    if (balances && currencies) {
      let cash = 0;
      balances.forEach((balance) => {
        if (preferredCurrency && balance.currency.id === preferredCurrency.id) {
          cash += balance.cash;
        } else {
          if (!rates) {
            return;
          }
          const conversionRate = rates.find(
            (rate) =>
              preferredCurrency &&
              rate.src.id === balance.currency.id &&
              rate.dst.id === preferredCurrency.id,
          );
          if (!conversionRate) {
            return;
          }
          cash += balance.cash * conversionRate.exchange_rate;
        }
      });
      return cash;
    } else {
      return null;
    }
  },
);

export const selectCurrentGroupQuotableSymbols = createSelector(
  selectCurrentGroupInfo,
  (groupInfo) => {
    if (groupInfo && groupInfo.quotable_symbols) {
      return groupInfo.quotable_symbols;
    }
    return null;
  },
);
//!NOTE! if need the actualPercentage use the other selector called `selectCurrentGroupPositionsWithActualPercentage`
export const selectCurrentGroupPositions = createSelector(
  selectCurrentGroupId,
  selectGroupInfo,
  selectCurrentGroupQuotableSymbols,
  selectCurrencies,
  selectCurrencyRates,
  (groupId, groupInfo, quotableSymbols, currencies, rates) => {
    let positions = null;
    if (
      groupId &&
      groupInfo &&
      groupInfo[groupId] &&
      groupInfo[groupId].data &&
      groupInfo[groupId].data!.positions &&
      groupInfo[groupId].data!.asset_classes_details &&
      quotableSymbols &&
      currencies &&
      rates
    ) {
      positions = groupInfo[groupId].data!.positions;

      let excluded_asset_classes = groupInfo[
        groupId
      ].data!.asset_classes_details.filter(
        (detail) => detail.asset_class.exclude_asset_class === true,
      );
      let excludedPositionsSymbolsIds = excluded_asset_classes
        .map((asset_classes) => {
          return asset_classes.symbols.map((symbol) => symbol.symbol);
        })
        .flat();

      positions.map((position) => {
        // TODO set this properly
        if (excludedPositionsSymbolsIds.includes(position.symbol.id)) {
          position.excluded = false;
        } else {
          position.excluded = true;
        }

        position.quotable = quotableSymbols.some(
          (quotableSymbol) => quotableSymbol.id === position.symbol.id,
        );
        return null;
      });
    }
    return positions;
  },
);

export const selectCurrentGroupBalancedEquity = createSelector(
  selectCurrentGroupPositions,
  selectCurrencies,
  selectCurrencyRates,
  selectPreferredCurrency,
  (positions, currencies, rates, preferredCurrency) => {
    if (!positions || !currencies || !rates || !preferredCurrency) {
      return null;
    }
    let total = 0;
    positions.forEach((position) => {
      if (
        preferredCurrency &&
        position.symbol.currency.id === preferredCurrency.id
      ) {
        total += position.units * position.price;
      } else {
        const conversionRate = rates.find(
          (rate) =>
            preferredCurrency &&
            rate.src.id === position.symbol.currency.id &&
            rate.dst.id === preferredCurrency.id,
        );
        if (!conversionRate) {
          return;
        }
        total += position.units * position.price * conversionRate.exchange_rate;
      }
    });
    return total;
  },
);

export const selectCurrentGroupTotalEquity = createSelector(
  selectCurrentGroupCash,
  selectCurrentGroupBalancedEquity,
  (cash, balancedEquity) => {
    if (cash !== null && balancedEquity !== null) {
      return cash + balancedEquity;
    } else {
      return null;
    }
  },
);

export const selectCurrentGroupTrades = createSelector(
  selectCurrentGroupId,
  selectGroupInfo,
  (groupId, groupInfo) => {
    let trades = null;
    if (
      groupId &&
      groupInfo &&
      groupInfo[groupId] &&
      groupInfo[groupId].data &&
      groupInfo[groupId].data!.calculated_trades
    ) {
      trades = groupInfo[groupId].data!.calculated_trades;
    }
    return trades;
  },
);

export const selectCurrentGroupTradesHasSkippedTrades = createSelector(
  selectCurrentGroupId,
  selectGroupInfo,
  (groupId, groupInfo) => {
    let trades = null;
    let hasSkippedTrades = false;
    if (
      groupId &&
      groupInfo &&
      groupInfo[groupId] &&
      groupInfo[groupId].data &&
      groupInfo[groupId].data!.calculated_trades
    ) {
      trades = groupInfo[groupId].data!.calculated_trades.trades;
      trades.forEach((trade) => {
        if (trade.skip_trade) {
          hasSkippedTrades = true;
          return hasSkippedTrades;
        }
      });
    }
    return hasSkippedTrades;
  },
);

export const selectCurrentGroupSymbols = createSelector(
  selectCurrentGroupInfo,
  (groupInfo) => {
    if (groupInfo && groupInfo.symbols) {
      return groupInfo.symbols;
    }
    return null;
  },
);

export const selectTotalGroupHoldings = createSelector(
  selectGroups,
  selectGroupInfo,
  selectCurrencies,
  selectCurrencyRates,
  selectGlobalPreferredCurrency,
  (groups, groupInfo, currencies, rates, preferredCurrency) => {
    let total = 0;
    if (groups && rates && currencies) {
      groups.forEach((group) => {
        if (
          groupInfo &&
          groupInfo[group.id] &&
          groupInfo[group.id].data &&
          groupInfo[group.id].data!.balances
        ) {
          groupInfo[group.id].data!.balances.forEach((balance) => {
            if (
              preferredCurrency &&
              balance.currency.id === preferredCurrency.id
            ) {
              total += balance.cash;
            } else {
              const conversionRate = rates.find(
                (rate) =>
                  preferredCurrency &&
                  rate.src.id === balance.currency.id &&
                  rate.dst.id === preferredCurrency.id,
              );
              if (!conversionRate) {
                return;
              }
              total += balance.cash * conversionRate.exchange_rate;
            }
          });
          groupInfo[group.id].data!.positions.forEach((position) => {
            if (
              preferredCurrency &&
              position.symbol.currency.id === preferredCurrency.id
            ) {
              total += position.units * position.price;
            } else {
              const conversionRate = rates.find(
                (rate) =>
                  preferredCurrency &&
                  rate.src.id === position.symbol.currency.id &&
                  rate.dst.id === preferredCurrency.id,
              );
              if (!conversionRate) {
                return;
              }
              total +=
                position.units * position.price * conversionRate.exchange_rate;
            }
          });
        }
      });
    }

    return total;
  },
);

export const selectCurrentGroupSetupComplete = createSelector<
  AppState,
  boolean,
  boolean
>(selectCurrentGroupTargetInitialized, (targetInitialized) => {
  return targetInitialized;
});

export const selectCurrentAccountId = createSelector<
  AppState,
  AppState,
  string | undefined
>(selectState, (state) => {
  const matchSelector = createMatchSelector<
    any,
    { groupId?: string; accountId?: string }
  >('/app/group/:groupId/account/:accountId');
  const match = matchSelector(state);
  if (!match) {
    return undefined;
  }
  return match.params.accountId;
});

export type AccountHoldings = {
  id: string;
  name: string;
  number: string;
  type: string;
  positions: Position[] | null;
};

export const selectCurrentAccountHoldings = createSelector<
  AppState,
  string | undefined,
  Account[] | undefined,
  SimpleListState<Balance[]>,
  SimpleListState<Position[]>,
  boolean,
  AccountHoldings | null
>(
  selectCurrentAccountId,
  selectAccounts,
  selectAccountBalances,
  selectAccountPositions,
  selectCurrentAccountPositionsError,
  (accountId, accounts, accountBalances, accountPositions, accountError) => {
    if (!accountId || !accounts || !accountBalances || !accountPositions) {
      return null;
    }
    const account = accounts.find((a) => a.id === accountId);
    if (!account) {
      return null;
    }

    let positions = null;
    if (accountPositions[account.id]) {
      positions = accountPositions[account.id].data;
    }
    return {
      id: account.id,
      name: account.name,
      number: account.number,
      type: account.meta.type,
      institution_name: account.institution_name,
      positions,
      error: accountError,
    };
  },
);

export const selectCurrentGroup = createSelector(
  selectGroups,
  selectCurrentGroupId,
  (groups, groupId) => {
    if (groupId) {
      if (!groups) {
        return undefined;
      }
      return groups.find((g) => g.id === groupId);
    }
    return null;
  },
);

export const selectCurrentAccount = createSelector(
  selectAccounts,
  selectCurrentAccountId,
  (accounts, accountId) => {
    if (accountId) {
      if (!accounts) {
        return undefined;
      }
      return accounts.find((a) => a.id === accountId);
    }
    return null;
  },
);

export const selectCurrentGroupExcludedEquity = createSelector(
  selectCurrentGroupId,
  selectGroupInfo,
  selectCurrencies,
  selectCurrencyRates,
  selectPreferredCurrency,
  (groupId, groupInfo, currencies, rates, preferredCurrency) => {
    let excludedEquity = 0;

    if (
      !groupId ||
      !groupInfo ||
      !groupInfo[groupId] ||
      !groupInfo[groupId].data ||
      !groupInfo[groupId].data!.asset_classes_details ||
      !currencies ||
      !rates ||
      !preferredCurrency
    ) {
      return excludedEquity;
    }
    let excluded_asset_classes = groupInfo[
      groupId
    ].data!.asset_classes_details.filter(
      (detail) => detail.asset_class.exclude_asset_class === true,
    );
    let excludedPositionsIds = excluded_asset_classes
      .map((asset_classes) => {
        return asset_classes.symbols.map((symbol) => symbol.symbol);
      })
      .flat();

    const allPositions = groupInfo[groupId].data!.positions;
    allPositions.forEach((position) => {
      if (excludedPositionsIds.includes(position.symbol.id)) {
        if (
          preferredCurrency &&
          position.symbol.currency.id === preferredCurrency.id
        ) {
          excludedEquity += position.units * position.price;
        } else {
          const conversionRate = rates.find(
            (rate) =>
              preferredCurrency &&
              rate.src.id === position.symbol.currency.id &&
              rate.dst.id === preferredCurrency.id,
          );
          if (!conversionRate) {
            return;
          }
          excludedEquity +=
            position.units * position.price * conversionRate.exchange_rate;
        }
      }
    });

    return excludedEquity;
  },
);

export const selectCurrentGroupTotalEquityExcludedRemoved = createSelector(
  selectCurrentGroupCash,
  selectCurrentGroupBalancedEquity,
  selectCurrentGroupExcludedEquity,
  (cash, balancedEquity, excludedEquity) => {
    if (cash === null || balancedEquity === null || excludedEquity === null) {
      return 0;
    }
    return cash + balancedEquity - excludedEquity;
  },
);

export const selectCurrentGroupTarget = createSelector(
  selectCurrentGroupInfo,
  selectCurrentGroupTotalEquityExcludedRemoved,
  selectCurrencyRates,
  selectPreferredCurrency,
  selectCurrentGroupTrades,
  (
    groupInfo,
    totalHoldingsExcludedRemoved,
    rates,
    preferredCurrency,
    calculatedTrades,
  ) => {
    if (
      !groupInfo ||
      !groupInfo.asset_classes_details ||
      totalHoldingsExcludedRemoved === null ||
      !rates
    ) {
      return null;
    }

    // get quotable symbols ticker
    const quotable_tickers = groupInfo.quotable_symbols.map(
      (symbol) => symbol.id,
    );

    const rebalance_by_asset_class =
      groupInfo.settings.rebalance_by_asset_class;

    let filtered_asset_classes_details = groupInfo.asset_classes_details.filter(
      (asset_class_detail) => asset_class_detail.symbols.length > 0,
    );

    filtered_asset_classes_details = groupInfo.asset_classes_details.filter(
      (asset_class_detail) =>
        asset_class_detail.asset_class_in_targets === false &&
        asset_class_detail.asset_class.exclude_asset_class === false,
    );

    let symbols_not_in_target = filtered_asset_classes_details
      .map((asset_class_detail) => {
        return asset_class_detail.symbols.map((symbol) => symbol.symbol).flat();
      })
      .flat();

    // add the target positions
    const currentTargetRaw = groupInfo.asset_classes_details;

    let currentTarget: TargetPosition[] = [];

    currentTargetRaw.forEach((targetRaw) => {
      if (rebalance_by_asset_class === false) {
        let targetRawSymbols = targetRaw.symbols;

        targetRawSymbols.forEach((symbol) => {
          let is_supported = quotable_tickers.includes(symbol.symbol);

          if (symbols_not_in_target.includes(symbol.symbol)) {
            return;
          }

          const target: TargetPosition = {
            id: symbol.symbol,
            symbol: symbol.symbol,
            percent: targetRaw.asset_class.percent,
            meta: {},
            fullSymbol: undefined,
            actualPercentage: 0,
            is_excluded: targetRaw.asset_class.exclude_asset_class,
            is_supported: is_supported,
          };

          target.fullSymbol = groupInfo.symbols.find(
            (symbol) => symbol.id === target.symbol,
          );

          const position = groupInfo.positions.find(
            (p) => p.symbol.id === target.symbol,
          );
          if (position && !target.is_excluded) {
            if (
              preferredCurrency &&
              position.symbol.currency.id === preferredCurrency.id
            ) {
              target.actualPercentage =
                ((position.price * position.units) /
                  totalHoldingsExcludedRemoved) *
                100;
            } else {
              const conversionRate = rates.find(
                (rate: any) =>
                  preferredCurrency &&
                  rate.src.id === position.symbol.currency.id &&
                  rate.dst.id === preferredCurrency.id,
              );
              if (conversionRate) {
                target.actualPercentage =
                  ((position.price * position.units) /
                    totalHoldingsExcludedRemoved) *
                  100 *
                  conversionRate.exchange_rate;
              }
            }
          } else {
            target.actualPercentage = 0;
          }
          currentTarget.push(target);
        });
      }
    });

    currentTarget.sort((a, b) => {
      let a_is_supported = Number(a.is_supported);
      let b_is_supported = Number(b.is_supported);
      if (a_is_supported - b_is_supported === -1) {
        return 1;
      } else {
        return 0;
      }
    });

    switch (groupInfo.settings.order_targets_by) {
      case 0:
        break;
      case 1:
        currentTarget
          .sort((a, b) => {
            if (a.percent - b.percent === 0) {
              if (a.actualPercentage - b.actualPercentage === 0) {
                return 1;
              } else {
                return a.actualPercentage - b.actualPercentage;
              }
            } else {
              return a.percent - b.percent;
            }
          })
          .reverse();
        break;
      case 2:
        currentTarget
          .sort((a, b) => {
            if (a.actualPercentage - b.actualPercentage === 0) {
              if (a.percent - b.percent === 0) {
                return 1;
              } else {
                return a.percent - b.percent;
              }
            } else {
              return a.actualPercentage - b.actualPercentage;
            }
          })
          .reverse();
        break;
      case 3:
        currentTarget
          .sort((a, b) => {
            let percentageErrorA =
              Math.round(
                ((a.percent - a.actualPercentage) / a.percent) * 100 * 10,
              ) / 10;
            let percentageErrorB =
              Math.round(
                ((b.percent - b.actualPercentage) / b.percent) * 100 * 10,
              ) / 10;

            if (percentageErrorA - percentageErrorB === 0) {
              if (a.actualPercentage - b.actualPercentage === 0) {
                return 1;
              } else {
                return a.actualPercentage - b.actualPercentage;
              }
            } else {
              return percentageErrorA - percentageErrorB;
            }
          })
          .reverse();
        break;
      case 4:
        currentTarget.sort((a, b) => {
          let percentageErrorA =
            Math.round(
              ((a.percent - a.actualPercentage) / a.percent) * 100 * 10,
            ) / 10;
          let percentageErrorB =
            Math.round(
              ((b.percent - b.actualPercentage) / b.percent) * 100 * 10,
            ) / 10;

          if (percentageErrorA - percentageErrorB === 0) {
            if (a.actualPercentage - b.actualPercentage === 0) {
              return -1;
            } else {
              return b.actualPercentage - a.actualPercentage;
            }
          } else {
            return percentageErrorA - percentageErrorB;
          }
        });
        break;
    }

    return currentTarget;
  },
);

export type DashboardGroup = {
  id: string;
  name: string;
  totalCash: number;
  totalHoldings: number;
  totalValue: number | null;
  accuracy?: number;
  setupComplete?: boolean;
  rebalance?: boolean;
  hasAccounts?: boolean;
  hasSells?: boolean;
  trades?: CalculatedTrades;
  brokerage_authorizations?: Authorization[];
  preferredCurrency?: Currency | null;
};

export const selectDashboardGroups = createSelector(
  selectGroups,
  selectGroupInfo,
  selectCurrencies,
  selectCurrencyRates,
  (groups, groupInfo, currencies, rates) => {
    const fullGroups: DashboardGroup[] = [];
    if (!groups || !rates) {
      return fullGroups;
    }
    groups.forEach((g) => {
      const group: DashboardGroup = {
        id: g.id,
        name: g.name,
        totalCash: 0,
        totalHoldings: 0,
        totalValue: null,
        hasSells: false,
        preferredCurrency: null,
      };
      if (groupInfo[group.id] && groupInfo[group.id].data) {
        const groupData = groupInfo[group.id].data!;
        group.preferredCurrency =
          currencies &&
          currencies.find(
            (c) => c.id === groupData.settings.preferred_currency,
          );

        groupData.balances.forEach((balance) => {
          if (
            group.preferredCurrency &&
            balance.currency.id === group.preferredCurrency.id
          ) {
            group.totalCash += balance.cash;
          } else {
            const conversionRate = rates.find(
              (rate) =>
                group.preferredCurrency &&
                rate.src.id === balance.currency.id &&
                rate.dst.id === group.preferredCurrency.id,
            );
            if (!conversionRate) {
              return;
            }
            group.totalCash += balance.cash * conversionRate.exchange_rate;
          }
        });
        groupData.positions.forEach((position) => {
          if (
            group.preferredCurrency &&
            position.symbol.currency.id === group.preferredCurrency.id
          ) {
            group.totalHoldings += position.units * position.price;
          } else {
            const conversionRate = rates.find(
              (rate) =>
                group.preferredCurrency &&
                rate.src.id === position.symbol.currency.id &&
                rate.dst.id === group.preferredCurrency.id,
            );
            if (!conversionRate) {
              return;
            }
            group.totalHoldings +=
              position.units * position.price * conversionRate.exchange_rate;
          }
        });
        group.accuracy = groupData.accuracy;
        if (
          groupData.settings.target_initialized &&
          groupData.asset_classes_details &&
          groupData.asset_classes_details.length > 0
        ) {
          group.setupComplete = true;
        } else {
          group.setupComplete = false;
        }
        group.rebalance = !!(
          groupData.calculated_trades &&
          groupData.calculated_trades.trades.length > 0
        );
        group.trades = groupData.calculated_trades;

        group.trades &&
          group.trades.trades.forEach((trade) => {
            if (trade.action === 'SELL') {
              group.hasSells = true;
            }
          });
        group.brokerage_authorizations = groupData.brokerage_authorizations;
      }
      if (group.totalCash !== null && group.totalHoldings !== null) {
        group.totalValue = group.totalCash + group.totalHoldings;
      }

      if (g.hasAccounts) {
        group.hasAccounts = true;
      } else {
        group.hasAccounts = false;
      }

      fullGroups.push(group);
    });

    return fullGroups;
  },
);

export const selectCurrentAccountCash = createSelector(
  selectCurrentAccountBalances,
  selectCurrencies,
  selectCurrencyRates,
  selectPreferredCurrency,
  (balances, currencies, rates, preferredCurrency) => {
    if (balances && currencies) {
      let cash = 0;
      balances.forEach((balance) => {
        if (preferredCurrency && balance.currency.id === preferredCurrency.id) {
          cash += balance.cash;
        } else {
          if (!rates) {
            return;
          }
          const conversionRate = rates.find(
            (rate) =>
              preferredCurrency &&
              rate.src.id === balance.currency.id &&
              rate.dst.id === preferredCurrency.id,
          );
          if (!conversionRate) {
            return;
          }
          cash += balance.cash * conversionRate.exchange_rate;
        }
      });
      return cash;
    } else {
      return null;
    }
  },
);

export const selectCurrentAccountBalancedEquity = createSelector(
  selectCurrentAccountPositions,
  selectCurrencies,
  selectCurrencyRates,
  selectPreferredCurrency,
  (positions, currencies, rates, preferredCurrency) => {
    if (!positions || !currencies || !rates || !preferredCurrency) {
      return null;
    }
    let total = 0;
    positions.forEach((position) => {
      if (
        preferredCurrency &&
        position.symbol.symbol.currency === preferredCurrency.id
      ) {
        total += position.units * position.price;
      } else {
        const conversionRate = rates.find(
          (rate) =>
            preferredCurrency &&
            rate.src.id === position.symbol.symbol.currency &&
            rate.dst.id === preferredCurrency.id,
        );
        if (!conversionRate) {
          return;
        }
        total += position.units * position.price * conversionRate.exchange_rate;
      }
    });
    return total;
  },
);

export const selectCurrentAccountTotalEquity = createSelector(
  selectCurrentAccountCash,
  selectCurrentAccountBalancedEquity,
  (cash, balancedEquity) => {
    if (cash !== null && balancedEquity !== null) {
      return cash + balancedEquity;
    } else {
      return null;
    }
  },
);

export type Group = {
  groupId: string;
  name: string;
  accounts: Account[];
};

export const selectGroupedAccounts = createSelector(
  selectAccounts,
  selectGroups,
  (accounts, groups) => {
    if (!accounts || !groups) {
      return null;
    }

    // sort by group
    accounts.sort((a, b) => {
      if (a.portfolio_group < b.portfolio_group) {
        return -1;
      }
      if (a.portfolio_group > b.portfolio_group) {
        return 1;
      }
      return 0;
    });

    const groupedAccounts: Group[] = [];
    groups.forEach((group) => {
      groupedAccounts.push({
        groupId: group.id,
        accounts: [],
        name: group.name,
      });
    });

    groupedAccounts.push({
      groupId: 'hidden',
      accounts: accounts.filter((a) => a.portfolio_group === null),
      name: 'Hidden Accounts',
    });

    accounts.forEach((account) => {
      const group = groupedAccounts.find(
        (g) => g.groupId === account.portfolio_group,
      );
      if (group) {
        group.accounts.push(account);
      }
    });

    return groupedAccounts;
  },
);

export const selectCurrentGroupAccounts = createSelector(
  selectCurrentGroupInfo,
  selectAccounts,
  (currentGroupInfo, accounts) => {
    return accounts.filter(
      (a) =>
        currentGroupInfo &&
        currentGroupInfo.accounts.find((account) => account.id === a.id),
    );
    // return currentGroupInfo && currentGroupInfo.accounts;
  },
);

export const selectCurrentGroupCashRestrictions = createSelector(
  selectCurrentGroupAccounts,
  selectCashRestrictions,
  (accounts, cashRestrictions) => {
    return cashRestrictions.filter(
      (c) => accounts && accounts.find((a) => a.id === c.account),
    );
  },
);

export const selectCurrentGroupPositionsWithActualPercentage = createSelector(
  selectCurrentGroupPositions,
  selectCurrentGroupTotalEquityExcludedRemoved,
  selectCurrencyRates,
  selectPreferredCurrency,
  (positions, totalHoldingsExcludedRemoved, rates, preferredCurrency) => {
    positions?.forEach((position) => {
      if (
        preferredCurrency &&
        position.symbol.currency.id === preferredCurrency.id
      ) {
        position.actualPercentage =
          ((position.price * position.units) / totalHoldingsExcludedRemoved) *
          100;
      } else {
        const conversionRate = rates?.find(
          (rate: any) =>
            preferredCurrency &&
            rate.src.id === position.symbol.currency.id &&
            rate.dst.id === preferredCurrency.id,
        );
        if (conversionRate) {
          position.actualPercentage =
            ((position.price * position.units) / totalHoldingsExcludedRemoved) *
            100 *
            conversionRate.exchange_rate;
        }
      }
    });
    return positions;
  },
);

export const selectCurrentGroupPositionsNotInTarget = createSelector(
  selectCurrentGroupPositions,
  selectCurrentGroupTarget,
  (positions, targets) => {
    let notInTarget = null;
    const targetIds = targets?.map((target: any) => target.fullSymbol.id);
    notInTarget = positions?.filter(
      (position: any) => targetIds?.indexOf(position.symbol.id) === -1,
    );
    return notInTarget;
  },
);
