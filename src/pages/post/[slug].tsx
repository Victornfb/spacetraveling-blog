import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { MdOutlineWatchLater } from 'react-icons/md';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { Comments } from '../../components/Coments';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    last_publication_date: string | null;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PaginationItem {
    uid: string;
    data: {
      title: string;
    }
}

interface PostProps {
  post: Post;
  pagination: {
    prevPost: PaginationItem[],
    nextPost: PaginationItem[],
  };
  preview: boolean;
}

export default function Post({ post, pagination, preview }: PostProps) {
  const router = useRouter()

  if(router.isFallback) {
    return <h1>Carregando...</h1>
  }

  const countWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length

    const words = contentItem.body.map(paragraph => paragraph.text.split(' ').length)
    words.map(word => (total += word))
    return total
  }, 0)

  const timeToRead = Math.ceil(countWords / 200)

  return (
    <>
    <Head>
      <title>{post.data.title} | spacetraveling</title>
    </Head>
    <main>
      <Header/>

      <img src={post.data.banner.url} className={styles.banner} alt="Banner" />

      <div className={commonStyles.contentContainer}>
        <article className={styles.post}>
            <h1>{post.data.title}</h1>

            <div className={styles.info}>
              <span className={styles.infoIcon}><FiCalendar /></span>
              <time>
                {format(
                    new Date(post.first_publication_date),
                    "PP",
                    { locale: ptBR }
                  )}
                </time>
              <span className={styles.infoIcon}><FiUser /></span>
              <span>{post.data.author}</span>
              <span className={styles.infoIcon}><MdOutlineWatchLater /></span>
              <span>{timeToRead} min</span>

              {post.data.last_publication_date > post.first_publication_date && (
                <i>* editado em {format(
                  new Date(post.data.last_publication_date),
                  `PP, 'às' p`,
                  { locale: ptBR }
                )}</i>
              )}
            </div>

            {post.data.content.map((content, index) => {
              return (
                <div key={index} className={styles.postContent}>
                  <h2>{content.heading}</h2>
                  <div
                    dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }}
                  />
                </div>
              )
            })}
        </article>
      </div>

      <section className={`${styles.pagination} ${commonStyles.contentContainer}`}>
        {pagination?.prevPost.length > 0 && (
          <div className={styles.prev}>
            <h3>{pagination.prevPost[0].data.title}</h3>
            <Link href={`/post/${pagination.prevPost[0].uid}`}>
              <a>Post anterior</a>
            </Link>
          </div>
        )}

        {pagination?.nextPost.length > 0 && (
          <div className={styles.next}>
            <h3>{pagination.nextPost[0].data.title}</h3>
            <Link href={`/post/${pagination.nextPost[0].uid}`}>
              <a>Próximo post</a>
            </Link>
          </div>
        )}
      </section>

      <Comments />

      {preview && (
        <aside>
          <Link href="/api/exit-preview">
            <a className={commonStyles.preview}>Sair do modo Preview</a>
          </Link>
        </aside>
      )}

    </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'publication')
  ])

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  })

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ params, preview = false, previewData }) => {
  const { slug } = params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('publication', String(slug), {
    ref: previewData?.ref || null,
  });

  if ( slug === 'favicon.png' ) {
    return {
        redirect: {
          destination: '/',
          permanent: false,
        }
    }
  }

  const prevPost = await prismic.query([
    Prismic.Predicates.at('document.type', 'publication')
  ],{
    pageSize: 1,
    after: response.id,
    orderings: '[document.first_publication_date]'
  })

  const nextPost = await prismic.query([
    Prismic.Predicates.at('document.type', 'publication')
  ],{
    pageSize: 1,
    after: response.id,
    orderings: '[document.last_publication_date desc]'
  })

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      last_publication_date: response.last_publication_date,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        }
      }),
    },
  }

  return {
    props: {
      post,
      pagination: {
        prevPost: prevPost?.results,
        nextPost: nextPost?.results,
      },
      preview,
    },
    revalidate: 60 * 60 * 24, // 1 day
  }
};
