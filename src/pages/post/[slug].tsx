import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PrismicDom from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
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
  const router = useRouter();
  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>title</Head>
      <header className={styles.containerImage}>
        <img src={post.data.banner.url} alt="image" />
      </header>
      <main className={commonStyles.container}>
        {post.data.content.map(content => (
          <div className={styles.posts}>
            <h2>{content.heading}</h2>
            {content.body.map(body => (
              <div dangerouslySetInnerHTML={{__html:body.text}}/>
            ))}
          </div>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType<any>('post');
  const paths = posts.results.map(post => {
    return {
      params: {
        id: post.uid,
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
  const response = await prismic.getByUID('posts', String(slug));
  const results = response.data.content.map(post => {
  return {
      heading: post.heading,
      body: post.body.map(body => body),
    };
  });
 
  return {
    props: {
      post: {
        first_publication_date: response.first_publication_date,
        data: {
          title: PrismicDom.RichText.asText(response.data.title),
          banner: {
            url: response.data.banner.url,
          },
          author: response.data.author,
          content: [...results].map(content => ({
            heading: content.heading,
            body: [{
              text: PrismicDom.RichText.asHtml(content.body),
            }],
          })),
        },
      },
    },
  };
};
