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
import { useState } from 'react';

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
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const {next_page, results} = postsPagination;
  const [posts, setPosts] = useState(results);
  const [nextPage, setNextPage] = useState(next_page);

  async function handleLoadNextPage(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const nextPosts = await (await fetch(nextPage)).json();

    if (nextPosts.results) {
      setPosts( [...posts, ...nextPosts.results] );
      setNextPage(nextPosts.next_page);
    }
  }

  return (
    <>
    <Head>
      <title>Home | spacetraveling</title>
    </Head>
    <main className={commonStyles.contentContainer}>
      <section>
        <Header />
        <div className={styles.contentContainer}>
          {posts.map(result => (
              <Link key={result.uid} href={`/post/${result.uid}`}>
                  <a key={result.uid}>
                    <strong>{result.data.title}</strong>
                    <p>{result.data.subtitle}</p>
                    <div className={styles.info}>
                      <span className={styles.infoIcon}><FiCalendar /></span>
                      <time>
                        {format(
                            new Date(result.first_publication_date),
                            "PP",
                            { locale: ptBR }
                          )}
                        </time>
                      <span className={styles.infoIcon}><FiUser /></span>
                      <span>{result.data.author}</span>
                    </div>
                  </a>
              </Link>
          ))}
        </div>
        {(nextPage)
          ? <button
              className={styles.loadButton}
              onClick={handleLoadNextPage}
            >Carregar mais posts</button>
          : ''}
      </section>

      {preview && (
        <aside>
          <Link href="/api/exit-preview">
            <a className={commonStyles.preview}>Sair do modo Preview</a>
          </Link>
        </aside>
      )}

    </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'publication')
  ], {
    fetch: ['publication.title', 'publication.subtitle', 'publication.author'],
    pageSize: 1,
  });

  const posts = postsResponse.results.map(post => {
      return {
          uid: post.uid,
          first_publication_date: post.first_publication_date,
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
        },
        preview,
      }
  }
};
