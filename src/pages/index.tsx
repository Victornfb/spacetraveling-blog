import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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

export default function Home({ postsPagination }: HomeProps) {
  const {next_page, results} = postsPagination;

  return (
    <>
    <Head>
      <title>Home | spacetraveling</title>
    </Head>
    <main className={styles.contentContainer}>
      <section>
        <Header />
        <div className={styles.posts}>
          {results.map(result => (
              <Link key={result.uid} href={`/post/${result.uid}`}>
                  <a key={result.uid}>
                    <strong>{result.data.title}</strong>
                    <p>{result.data.subtitle}</p>
                    <div className={styles.info}>
                      <span className={styles.infoIcon}><FiCalendar /></span>
                      <time>{result.first_publication_date}</time>
                      <span className={styles.infoIcon}><FiUser /></span>
                      <span>{result.data.author}</span>
                    </div>
                  </a>
              </Link>
          ))}
        </div>
        {(next_page)
          ? <button className={styles.loadButton}>Carregar mais posts</button>
          : ''}
      </section>
    </main>
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'publication')
  ], {
    fetch: ['publication.title', 'publication.subtitle', 'publication.author'],
    pageSize: 20,
  });

  const posts = postsResponse.results.map(post => {
      return {
          uid: post.uid,
          first_publication_date: format(
            new Date(),
            "PP",
            { locale: ptBR }
          ),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
      }
  })

  return {
      props: {
        postsPagination: {
          next_page: postsResponse.next_page,
          results: posts,
        }
      }
  }
};
