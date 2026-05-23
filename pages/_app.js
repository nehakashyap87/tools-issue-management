import 'bootstrap/dist/css/bootstrap.min.css'
import "@/styles/globals.css";
import 'bootstrap-icons/font/bootstrap-icons.css'
import CheckFooter from '@/components/CheckFooter';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (<>
  <Head>
    <title>Tool Issue Management System</title>
    <meta name="description" content="Tool inventory management system" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </Head>
  <Component {...pageProps} />
  <CheckFooter/>
  </>)
}
