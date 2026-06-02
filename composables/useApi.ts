import {
  AdminApi,
  BackgroundTasksApi,
  CodesApi,
  DashboardApi,
  FacilitiesApi,
  MasterRecordsApi,
  MessagesApi,
  MirthApi,
  PatientIndexOperationsApi,
  PatientRecordsApi,
  SearchApi,
  SystemInfoApi,
  UKRDCRecordGroupApi,
  WorkItemsApi,
} from "@ukkidney/ukrdc-axios-ts";
import axios from "axios";

import useAuth from "./useAuth";

interface HTTPException {
  detail: string;
}

interface PydanticError {
  loc: string[];
  msg: string;
  type: string;
}

function decodePydanticErrors(errors: PydanticError[]) {
  let errorMessage = "Parameter Error\n";
  for (const error of errors) {
    const msg = `${error.loc.join("/")}: ${error.msg}`;
    errorMessage += `${msg}\n`;
  }
  return errorMessage;
}

export default function () {
  const { $sentryCaptureException } = useNuxtApp();
  const toast = useToast();
  const { $okta } = useAuth();

  const runtimeConfig = useRuntimeConfig();

  const defaultHeaders = {
    Accept: "application/json",
  };

  // Create a custom axios instance
  const apiInstance = axios.create({
    headers: defaultHeaders,
  });

  // Request interceptor to handle API base paths and authentication
  apiInstance.interceptors.request.use(async (config) => {
    // If auth has expired, reauthenticate before proceeding with the API request
    if (!$okta.isAuthenticated) {
      await $okta.signInWithRedirect();
    }

    // Add the authorization header to each request
    const token = $okta.getAccessToken();
    if (config.headers === undefined) {
      config.headers = defaultHeaders;
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  // Response interceptor to handle API errors
  apiInstance.interceptors.response.use(
    (response) => response,
    (e) => {
      // We handle some error status codes specially

      // A 401 error from the API means unauthenticated, which usually only happens if the user
      // has started a new session and the API Axios instance has sent a request before Okta has
      // had chance to refresh.
      // In this case we just want to reject the request early and let Okta handle the refresh.
      // There's no need to report to Sentry.
      if (e.response?.status === 401 || e.response?.status === 403) {
        return Promise.reject(e);
      }

      // For internal API server errors, redirect to error page without reporting
      // We're assuming here that the API server will log the related error, and so reporting
      // to Sentry here would just leads to duplicate messages.
      if (e.response?.status === 0 || e.response?.status === 500) {
        // Redirect to error page
        showError({
          fatal: true,
          statusCode: 500,
          message: "An internal error occured. Our developers have been notified.",
        });
        // Resolve the promise
        return Promise.reject(e);
      }

      // Build message and redirect to error page without reporting
      // We're again assuming here that the API server will log the related error, and so reporting
      // to Sentry here just leads to duplicate messages.
      if (e.response?.status === 422) {
        // Redirect to error page
        const msg = decodePydanticErrors(e.response.data.detail);
        showError({ fatal: true, statusCode: 422, message: msg });
        // Resolve the promise
        return Promise.reject(e);
      }

      // For all other error codes

      // Compute what message to show in the toast
      if (process.client) {
        const responseData = e.response?.data as HTTPException;
        const msgToShow = responseData.detail ?? e.message;

        // If we have no message to show, don't create a toast
        if (msgToShow) {
          toast.add({
            title: "Error Fetching Data",
            description: msgToShow,
            color: "red",
            timeout: 5000,
          });
        }
      }

      // Log unhandled exceptions to Sentry, if Sentry is set up
      if (typeof $sentryCaptureException === "function") {
        $sentryCaptureException(e);
      }

      // Reject the promise so the component that triggered the request can handle the error
      return Promise.reject(e);
    },
  );

  let baseUrl: string;
  // If we actually set the baseUrl to / then request URLs become absolute, e.g. https://api/v1/...
  // If we set it to an empty string then the host defaults to localhost.
  // This is not what we want, so we need to replace these cases with window.location.host.
  if (!runtimeConfig.public.api.host || runtimeConfig.public.api.host === "/") {
    baseUrl = `${runtimeConfig.public.api.protocol}://${window.location.host}`;
  } else {
    baseUrl = `${runtimeConfig.public.api.protocol}://${runtimeConfig.public.api.host}`;
  }

  // Create API instances
  const adminApi = new AdminApi(undefined, baseUrl, apiInstance);
  const dashboardApi = new DashboardApi(undefined, baseUrl, apiInstance);
  const systemInfoApi = new SystemInfoApi(undefined, baseUrl, apiInstance);
  const codesApi = new CodesApi(undefined, baseUrl, apiInstance);
  const searchApi = new SearchApi(undefined, baseUrl, apiInstance);
  const facilitiesApi = new FacilitiesApi(undefined, baseUrl, apiInstance);
  const masterRecordsApi = new MasterRecordsApi(undefined, baseUrl, apiInstance);
  const patientRecordsApi = new PatientRecordsApi(undefined, baseUrl, apiInstance);
  const backgroundTasksApi = new BackgroundTasksApi(undefined, baseUrl, apiInstance);
  const patientIndexOperationsApi = new PatientIndexOperationsApi(undefined, baseUrl, apiInstance);
  const mirthApi = new MirthApi(undefined, baseUrl, apiInstance);
  const workItemsApi = new WorkItemsApi(undefined, baseUrl, apiInstance);
  const messagesApi = new MessagesApi(undefined, baseUrl, apiInstance);
  const ukrdcRecordGroupApi = new UKRDCRecordGroupApi(undefined, baseUrl, apiInstance);

  return {
    adminApi,
    dashboardApi,
    systemInfoApi,
    codesApi,
    searchApi,
    facilitiesApi,
    masterRecordsApi,
    patientRecordsApi,
    backgroundTasksApi,
    patientIndexOperationsApi,
    mirthApi,
    workItemsApi,
    messagesApi,
    ukrdcRecordGroupApi,
  };
}
