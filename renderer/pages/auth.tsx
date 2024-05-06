import { getAuthUrl, getTokens } from '../utils/auth';

export default function AuthPage({ url }) {
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }

  return null;
}

export async function getServerSideProps({ query }) {
  if (query.code) {
    const tokens = await getTokens(query.code);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('youtube_tokens', JSON.stringify(tokens));
    }
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const url = getAuthUrl();
  return {
    props: {
      url,
    },
  };
}
