import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  return (
    <>
    <Head>
      <title>Home | spacetraveling</title>
    </Head>
    <main className={styles.contentContainer}>
      <section>
        <img className={styles.logo} src="/images/Logo.svg" alt="logo" />
        <div className={styles.posts}>
          <Link href="/post/1.tsx">
            <a>
              <strong>Como utilizar Hooks</strong>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <div className={styles.info}>
                <span className={styles.infoIcon}><FiCalendar /></span>
                <time>15 Mar 2021</time>
                <span className={styles.infoIcon}><FiUser /></span>
                <span>Joseph Oliveira</span>
              </div>
            </a>
          </Link>
          <Link href="/post/1.tsx">
            <a>
              <strong>Como utilizar Hooks</strong>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <div className={styles.info}>
                <span className={styles.infoIcon}><FiCalendar /></span>
                <time>15 Mar 2021</time>
                <span className={styles.infoIcon}><FiUser /></span>
                <span>Joseph Oliveira</span>
              </div>
            </a>
          </Link>
          <Link href="/post/1.tsx">
            <a>
              <strong>Como utilizar Hooks</strong>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <div className={styles.info}>
                <span className={styles.infoIcon}><FiCalendar /></span>
                <time>15 Mar 2021</time>
                <span className={styles.infoIcon}><FiUser /></span>
                <span>Joseph Oliveira</span>
              </div>
            </a>
          </Link>
        </div>
        <button className={styles.loadButton}>Carregar mais posts</button>
      </section>
    </main>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
