import React from 'react'
import { createBrowserRouter, LoaderFunctionArgs, RouteObject } from 'react-router-dom'
import ContainersPage from './pages/docker/Containers.page.tsx'
import ContainerPage from './pages/docker/Container.page.tsx'
import ContainerLaunchPage from './pages/docker/ContainerLaunch.page.tsx'
import ContainerRunPage from './pages/docker/ContainerRun.page.tsx'
import DashboardPage from './pages/docker/Dashboard.page.tsx'
import ImagesPage from './pages/docker/Images.page.tsx'
import NetworksPage from './pages/docker/Networks.page.tsx'
import StacksPage from './pages/docker/Stacks.page.tsx'
import StackPage from './pages/docker/StackPage.tsx'
import EventsPage from './pages/docker/Events.page.tsx'
import EnvironmentsPage from './pages/admin/Environments.page.tsx'
import LoginPage from './pages/user/Login.page.tsx'
import PortainerTemplatesPage from './pages/portainer/PortainerTemplates.page.tsx'
import SettingsPage from './pages/admin/Settings.page.tsx'
import VolumesPage from './pages/docker/Volumes.page.tsx'
import AuthenticatedRouteWrapper from './pages/AuthenticatedRouteWrapper.tsx'
import EnvironmentRouteWrapper from './pages/EnvironmentRouteWrapper.tsx'
import LayoutRouteWrapper from './pages/LayoutRouteWrapper.tsx'
import RoutingErrorBoundary from './pages/RoutingErrorBoundary.tsx'
import PageNotFound from './pages/PageNotFound.tsx'
import api from './lib/api2.ts'
import appRepo from './lib/repo.ts'
import { restoreEnvsFromLocalStorage, defaultEnvs } from './helper/useEnvironments.ts'
import { loadAppStore } from './lib/appStore.ts'
import { DEFAULT_AGENT_PORT } from './constants.ts'

const getEnvApiFromLoaderArgs = (args: LoaderFunctionArgs) => {
  //const { envs } = useEnvironments()
  if (!args?.params?.envId) {
    throw new Error('Not in an environment')
  }

  const envId = args.params.envId
  let envs = restoreEnvsFromLocalStorage()
  if (!envs) {
    envs = defaultEnvs
  }
  const env = envs.find((env) => env.id === envId)
  if (!env) {
    throw new Error(`Environment ${envId} not found`)
  }

  const urlSchema = env.useSSL ? 'https' : 'http'
  const hostname = env.hostname || ''
  const agentPort = env.agentPort || DEFAULT_AGENT_PORT
  const apiBaseUrl = `${urlSchema}://${hostname}:${agentPort}/api`

  const appStore = loadAppStore()
  const authToken = appStore?.authToken
  return api(apiBaseUrl, authToken)
}

const routes: RouteObject[] = [
  {
    path: '/auth',
    //element: <AuthRouteWrapper />,
    errorElement: <RoutingErrorBoundary />,

    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/',
    element: <AuthenticatedRouteWrapper />,
    errorElement: <RoutingErrorBoundary />,

    children: [
      {
        //element: <LayoutRouteWrapper />,
        children: [
          {
            index: true,
            //path: 'environments',
            element: <EnvironmentsPage />,
            // loader: async (args) => {
            //   return api(AGENT_API_BASEURL).getEnvironments()()
            // },
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },

          {
            path: ':envId',
            element: <EnvironmentRouteWrapper />,
            children: [
              {
                index: true,
                element: <DashboardPage />,
                // loader: async (args) => {
                //   return null
                // },
              },
              {
                path: 'docker',
                //element: <DockerWrapper />,
                children: [
                  { index: true, element: <DashboardPage /> },
                  {
                    path: 'containers',
                    element: <ContainersPage />,
                    loader: async (args) => {
                      const api = getEnvApiFromLoaderArgs(args)
                      //return api.getContainers()()
                      return appRepo(args.params.envId!, api).listContainers()
                    },
                  },
                  {
                    path: 'containers/create',
                    element: <ContainerLaunchPage />,
                  },
                  {
                    path: 'containers/:id',
                    element: <ContainerPage />,
                    loader: async (args) => {
                      //console.log('Loading container', args)
                      if (!args.params.id) {
                        throw new Error('Container id not provided')
                      }
                      return getEnvApiFromLoaderArgs(args).getContainer()(args.params.id)
                    },
                  },
                  {
                    path: 'images',
                    element: <ImagesPage />,
                    loader: async (args) => {
                      return getEnvApiFromLoaderArgs(args).getImages()()
                    },
                  },
                  {
                    path: 'volumes',
                    element: <VolumesPage />,
                    loader: async (args) => {
                      return getEnvApiFromLoaderArgs(args).getVolumes()()
                    },
                  },
                  {
                    path: 'networks',
                    element: <NetworksPage />,
                    loader: async (args) => {
                      return getEnvApiFromLoaderArgs(args).getNetworks()()
                    },
                  },
                  {
                    path: 'events',
                    element: <EventsPage />,
                    loader: async (args) => {
                      return getEnvApiFromLoaderArgs(args).getEngineEvents()({})
                    },
                  },
                  {
                    path: 'stacks',
                    element: <StacksPage />,
                    loader: async (args) => {
                      //return getHostApiFromLoaderArgs(args).getStacks()()
                      const api = getEnvApiFromLoaderArgs(args)
                      return appRepo(args.params.envId!, api).listStacks()
                    },
                  },
                  {
                    path: 'stacks/:id',
                    element: <StackPage />,
                    loader: async (args) => {
                      if (!args.params.id) {
                        throw new Error('Stack id not provided')
                      }
                      return getEnvApiFromLoaderArgs(args).getStack()(args.params.id)
                    },
                  },
                  {
                    path: 'templates/portainer',
                    element: <PortainerTemplatesPage />,
                    // loader: async ({ params }) => {
                    //   return getHostApiFromLoaderArgs(args).getProject()(params.id!)
                    // },
                  },
                  {
                    path: 'run',
                    element: <ContainerRunPage />,
                    // loader: async ({ params }) => {
                    //   return getHostApiFromLoaderArgs(args).getProject()(params.id!)
                    // },
                  },
                ],
              },
            ],
          },

          { path: '*', element: <PageNotFound /> },
        ],
      },
    ],
  },
]

const router = createBrowserRouter(routes)

export default router
