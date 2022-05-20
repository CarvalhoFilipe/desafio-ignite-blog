import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import Prismic from '@prismicio/client';
import PrismicDom from 'prismic-dom';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatDate } from '../helpers/formartDate';
import { useState } from 'react';
import { nextPageService } from '../services/nextPage';
import { HomeProps, Post } from './interface/HomeInterface';

export default function Home({ postsPagination }: HomeProps) {
  const { results, next_page } = postsPagination;
  console.log(next_page);
  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPage, setNextPage] = useState<string>(next_page);

  const nextPost = async (url: string) => {
    const { next_page: newNextPage, results: newResults } =
      await nextPageService(url);
    setNextPage(newNextPage);
    const newPost = newResults.map(post => {
      return {
        uid: post.uid,
        first_publication_date: formatDate(post.first_publication_date),
        data: {
          title: PrismicDom.RichText.asText(post.data.title),
          subtitle: PrismicDom.RichText.asText(post.data.subtitle),
          author: PrismicDom.RichText.asText(post.data.author),
        },
      };
    });
    setPosts(state => [...state, ...newPost]);
  };

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={commonStyles.info}>
                  <AiOutlineCalendar />
                  <time>{post.first_publication_date}</time>
                  <AiOutlineUser />
                  <span>{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
          {nextPage && (
            <button onClick={() => nextPost(nextPage)}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType<any>('posts', {
    pageSize: 1,
  });
  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
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
