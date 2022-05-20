import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useMemo } from 'react';
import { formatDate } from '../../helpers/formartDate';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

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
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const total = useMemo(() => {
    const totalWords = post.data.content.reduce(
      (totalContent, currentContent) => {
        const headingWords = currentContent.heading?.split(' ').length || 0;

        const bodyWords = currentContent.body.reduce(
          (totalBody, currentBody) => {
            const textWords = currentBody.text.split(' ').length;
            return totalBody + textWords;
          },
          0
        );

        return totalContent + headingWords + bodyWords;
      },
      0
    );
    return totalWords;
  }, [post]);

  const timeEstimmed = Math.ceil(total / 200);

  return (
    <main className={styles.main}>
      <Head>title</Head>
      <header>
        <img src={post.data.banner.url} alt="banner" />
      </header>

      <article className={commonStyles.container}>
        <h1>{post.data.title}</h1>
        <div className={commonStyles.info}>
          <time>
            <FiCalendar />
          </time>
          <span>
            {formatDate(post.first_publication_date)}
          </span>
          <span>
            <FiUser />
          </span>
          <span> {post.data.author}</span>
          <time>
            <FiClock />
          </time>
          <span>{timeEstimmed} min</span>
        </div>
        {post.data.content.map(content => (
          <div key={content.heading} className={styles.posts}>
            <h2>{content.heading}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </div>
        ))}
      </article>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});

  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: [...content.body],
      })),
    },
  } as Post;

  return {
    props: {
      post,
    },
  };
};
