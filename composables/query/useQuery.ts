/*
Builds computed properties with get and set methods.
Get will read from the current router query, and
set will change the current router query.

Type conversion is handled via the various included
methods. E.g. boolearQuery will parse the query string
and return a boolean.
*/

import { getFirstOrValue } from "~/helpers/queryUtils";

export default function () {
  const route = useRoute();
  const router = useRouter();

  function pushNewQuery(queryKey: string, newValue: any, history: boolean = true, resetPage: boolean = false) {
    const newQuery = Object.assign({}, route.query, {
      [queryKey]: [newValue],
    });
    if (resetPage) {
      newQuery.page = ["1"];
    }
    if (history) {
      router.push({
        path: route.path,
        query: newQuery,
      });
    } else {
      router.replace({
        path: route.path,
        query: newQuery,
      });
    }
  }

  function arrayQuery(
    queryKey: string,
    defaultValue: (string | null)[] | undefined = [],
    history: boolean = true,
    resetPage: boolean = false,
  ) {
    return computed({
      get: (): (string | null)[] | undefined => {
        const val = route.query[queryKey];
        if (val === undefined) {
          return defaultValue;
        }
        if (!Array.isArray(val)) {
          return [val];
        } else {
          return val;
        }
      },
      set: (newValue: (string | null)[] | undefined) => {
        const newQuery = Object.assign({}, route.query, {
          [queryKey]: newValue,
        });
        if (resetPage) {
          newQuery.page = ["1"];
        }
        if (history) {
          router.push({
            path: route.path,
            query: newQuery,
          });
        } else {
          router.replace({
            path: route.path,
            query: newQuery,
          });
        }
      },
    });
  }

  function booleanQuery(queryKey: string, history: boolean = true, resetPage: boolean = false) {
    return computed({
      get: (): boolean | undefined => {
        return getFirstOrValue(route.query[queryKey]) === "true";
      },
      set: (newValue: boolean | undefined) => {
        pushNewQuery(queryKey, newValue, history, resetPage);
      },
    });
  }

  function stringQuery(
    queryKey: string,
    defaultValue: string | undefined = undefined,
    history: boolean = true,
    resetPage: boolean = false,
  ) {
    return computed({
      get: (): string | undefined => {
        const val = getFirstOrValue(route.query[queryKey]);
        if (val === null || val === undefined) {
          return defaultValue;
        }
        return val;
      },
      set: (newValue: string | undefined) => {
        // Check if the query has actually changed
        const current = getFirstOrValue(route.query[queryKey]);
        if (current !== null && current !== undefined) {
          // If no change, skip navigation
          if (current === newValue) {
            return;
          }
        }
        pushNewQuery(queryKey, newValue, history, resetPage);
      },
    });
  }

  function integerQuery(
    queryKey: string,
    defaultValue: number | undefined = undefined,
    history: boolean = true,
    resetPage: boolean = false,
  ) {
    return computed({
      get: (): number | undefined => {
        const val = getFirstOrValue(route.query[queryKey]);
        if (val === null || val === undefined) {
          return defaultValue;
        }
        return parseInt(val);
      },
      set: (newValue: number | undefined) => {
        // Check if the query has actually changed
        const current = getFirstOrValue(route.query[queryKey]);
        if (current !== null && current !== undefined) {
          // If no change, skip navigation
          if (parseInt(current) === newValue) {
            return;
          }
        }
        pushNewQuery(queryKey, newValue, history, resetPage);
      },
    });
  }

  return { integerQuery, booleanQuery, stringQuery, arrayQuery };
}
