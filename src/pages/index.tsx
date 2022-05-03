import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import PrismicDom from 'prismic-dom';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatDate } from '../helpers/formartDate';

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
  const { results } = postsPagination;
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {results.map(post => (
            <Link href="/">
              <a key={post.uid}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <AiOutlineCalendar />
                  <time>{post.first_publication_date}</time>
                  <AiOutlineUser />
                  <label>{post.data.author}</label>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType<any>('posts', {
    pageSize: 2,
  });

  const results = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      first_publication_date: formatDate(post.first_publication_date),
      data: {
        title: PrismicDom.RichText.asText(post.data.title),
        subtitle: PrismicDom.RichText.asText(post.data.subtitle),
        author: PrismicDom.RichText.asText(post.data.author),
      },
    };
  });
  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
    },
  };
};
