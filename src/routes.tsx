import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './pages/layout/Layout';
import { MyPageLayout } from './pages/layout/MyPageLayout';

/** 아이디어 마켓 */
import IdeaMarketMain from './pages/idea-market/IdeaMarketMain';
import IdeaMarketMarketPlace from './pages/idea-market/IdeaMarketMarketPlace';
import IdeaRegisteredPage from './pages/idea-market/IdeaRegisteredPage';
import IdeaMarketRegister from './pages/idea-market/IdeaMarketRegister';

const IdeaMarketRegisterComplete = lazy(
  () => import('./pages/idea-market/IdeaMarketRegisterComplete'),
);
const IdeaMarketPayment = lazy(
  () => import('./pages/idea-market/IdeaMarketPayment'),
);
const PaymentProcessing = lazy(
  () => import('./pages/idea-market/PaymentProcessing'),
);
const PaymentFail = lazy(() => import('./pages/idea-market/PaymentFail'));
const PaymentCancel = lazy(() => import('./pages/idea-market/PaymentCancel'));
const PaymentSuccess = lazy(() => import('./pages/idea-market/PaymentSuccess'));

/** 요청 과제 */
import RequestAssignMain from './pages/request-assign/RequestAssignMain';
import RequestAssignTechZone from './pages/request-assign/RequestAssignTechZone';
import RequestRegisteredPage from './pages/request-assign/RequestRegisteredPage';
const RequestAssignRegisterNow = lazy(
  () => import('./pages/request-assign/RequestAssignRegister'),
);
const RequestAssignRegisterComplete = lazy(
  () => import('./pages/request-assign/RequestAssignRegisterComplete'),
);

/** 협업 광장 */
import CollaborationMain from './pages/collaboration/CollaborationMain';
import PostDetailWithLink from './pages/collaboration/PostDetailWithLink';
import CollaborationRegister from './pages/collaboration/CollaborationRegister';

/** 마이페이지 */
import PostsIdeaMarket from './pages/my-page/postsIdeaMarket/PostsIdeaMarket';
import Info from './pages/my-page/info/Info';
import MyPage from './pages/my-page/myPage/MyPage';
import RecentNews from './pages/my-page/myPage/RecentNews';
import MyPagePosts from './pages/my-page/myPagePosts/MyPagePosts';
import PostsRequestAssign from './pages/my-page/postsRequestAssign/PostsRequestAssign';
import PostsCollaboration from './pages/my-page/postsCollaboration/PostsCollaboration';
import IdeaMarketRegistered from './pages/my-page/postsIdeaMarket/IdeaMarketRegistered';
import RequestAssignRegistered from './pages/my-page/postsRequestAssign/RequestAssignRegistered';
import CollaborationRegistered from './pages/my-page/postsCollaboration/CollaborationRegistered';
import IdeaMarketEdit from './pages/my-page/postsIdeaMarket/IdeaMarketEdit';
import PurchaseList from './pages/my-page/apply/PurchaseList';
import ApplyRequest from './pages/my-page/apply/ApplyRequest';
import ApplyCollaboration from './pages/my-page/apply/ApplyCollaboration';
import Portfolio from './pages/my-page/portfolio/Portfolio';
import Message from './pages/my-page/message/Message';
import SavedPosts from './pages/my-page/saved-posts/SavedPosts';

/**  */
import ErrorPage from './pages/errorPage/ErrorPage';
import PersonalProfile from './pages/personal-profile/PersonalProfile';

const Main = lazy(() => import('./pages/main/main'));
const Signup = lazy(() => import('./pages/sign-up/Signup'));
const Login = lazy(() => import('./pages/login/Login'));

export const routes = createBrowserRouter([
  {
    path: '/login',
    element: <Main />,
  },
  {
    path: '/sign-up',
    element: <Signup />,
  },
  {
    path: '/login/personal',
    element: <Login userType='personal' />,
  },
  {
    path: 'login/corporate',
    element: <Login userType='corporate' />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <IdeaMarketMain />,
      },
      {
        path: '/idea-market',
        element: <IdeaMarketMain />,
      },
      {
        path: '/idea-market/market-place',
        element: <IdeaMarketMarketPlace />,
      },
      {
        path: '/idea-market/register',
        element: <IdeaMarketRegister />,
      },
      {
        path: '/idea-market/register-complete',
        element: <IdeaMarketRegisterComplete />,
      },
      {
        path: '/idea-market/registered/:ideaId',
        element: <IdeaRegisteredPage />,
      },
      {
        path: '/idea-market/payment/:ideaId',
        element: <IdeaMarketPayment />,
      },
      {
        path: '/purchase/approve',
        element: <PaymentProcessing />,
      },
      {
        path: '/idea-market/payment-fail',
        element: <PaymentFail />,
      },
      {
        path: '/idea-market/payment-cancel',
        element: <PaymentCancel />,
      },
      {
        path: '/idea-market/payment-success',
        element: <PaymentSuccess />,
      },
      {
        path: '/request-assign',
        element: <RequestAssignMain />,
      },
      {
        path: '/request-assign/open-idea',
        element: <RequestAssignMain />,
      },
      {
        path: '/request-assign/tech-zone',
        element: <RequestAssignTechZone />,
      },
      {
        path: '/request-assign/register',
        element: <RequestAssignRegisterNow />,
      },
      {
        path: '/request-assign/register-complete',
        element: <RequestAssignRegisterComplete />,
      },
      {
        path: '/request-assign/registered/:taskId',
        element: <RequestRegisteredPage />,
      },
      {
        path: '/collaboration',
        element: <CollaborationMain />,
      },
      {
        path: '/collaboration/register',
        element: <CollaborationRegister />,
      },
      {
        path: '/personal-profile/:id/:userType',
        element: <PersonalProfile />,
      },
      {
        path: '/collaboration/postdetailwithlink/:collaborationId',
        element: <PostDetailWithLink />,
      },
      {
        element: <MyPageLayout />,
        children: [
          {
            path: '/my',
            element: <MyPage />,
          },
          {
            path: '/my/info',
            element: <Info />,
          },
          {
            path: '/my/recent-news',
            element: <RecentNews />,
          },
          {
            path: '/my/posts',
            element: <MyPagePosts />,
          },
          {
            path: '/my/posts/idea-market/:ideaId',
            element: <PostsIdeaMarket />,
          },
          {
            path: '/my/posts/request-assign/:taskId',
            element: <PostsRequestAssign />,
          },
          {
            path: '/my/posts/collaboration/:collaborationId',
            element: <PostsCollaboration />,
          },
          {
            path: '/my/posts/idea-market/registered/:ideaId',
            element: <IdeaMarketRegistered />,
          },
          {
            path: '/my/posts/request-assign/registered/:taskId',
            element: <RequestAssignRegistered />,
          },
          {
            path: '/my/posts/collaboration/registered/:collaborationId',
            element: <CollaborationRegistered />,
          },
          {
            path: '/my/posts/idea-market/edit/:ideaId',
            element: <IdeaMarketEdit />,
          },
          // {
          //   path: '/my/posts/request-assign/edit/:taskId',
          //   element: <RequestAssignEdit />,
          // },
          // {
          //   path: '/my/posts/collaboration/edit/:collaborationId',
          //   element: <CollaborationEdit />,
          // },
          {
            path: '/my/portfolio',
            element: <Portfolio />,
          },
          {
            path: '/my/apply-idea-market',
            element: <PurchaseList />,
          },
          {
            path: '/my/apply-request',
            element: <ApplyRequest />,
          },
          {
            path: '/my/apply-collaboration',
            element: <ApplyCollaboration />,
          },
          {
            path: '/my/message',
            element: <Message />,
          },
          {
            path: '/my/save',
            element: <SavedPosts />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
]);
