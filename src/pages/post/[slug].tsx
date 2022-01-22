import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
    <Head>
      <title>Título do Post | spacetraveling</title>
    </Head>
    <main className={commonStyles.contentContainer}>
      <Header/>
    </main>
    </>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'publication')
  ], {
      fetch: ['publication.uid'],
      pageSize: 20,
  })

  const slug = await posts.results.map(result => result.uid)[0];

  return {
    paths: [
      { params: {
          slug
        }
      }
    ],
    fallback: 'blocking'
  }
};

export const getStaticProps = async context => {
  const { slug } = context.params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('publication', String(slug), {});

  if ( slug === 'favicon.png' ) {
    return {
        redirect: {
        destination: '/',
        permanent: false,
        }
    }
  }

  return {
    props: {
      post: {
        uid: response.uid,
        first_publication_date: response.first_publication_date,
        data: response.data
      }
    },
    revalidate: 60 * 60 * 24, // 1 day
  }
};
