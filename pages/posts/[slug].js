import Head from "next/head";
import Image from "next/image";
import { GraphQLClient, gql } from "graphql-request";
import styles from "../../styles/Slug.module.css";
import Link from "next/link";

//インスタンス化
const graphcms = new GraphQLClient(
  "https://api-ap-northeast-1.hygraph.com/v2/clbyfz6um0d5701urfx8031n8/master"
);

//hygraphで作成し、指定したオブジェクトをAPI経由で取得
const QUERY = gql`
  query post($slug: String!) {
    post(where: { slug: $slug }) {
      id
      title
      slug
      datePublished
      author {
        name
        avatar {
          url
        }
      }
      content {
        html
      }
      photo {
        createdBy {
          id
        }
        url
      }
    }
  }
`;

const SLUGLIST = gql`
  {
    posts {
      slug
    }
  }
`;

// SSRを設定する場合は下記はセットとなる
// getStaticPaths
// getStaticProps

export async function getStaticPaths() {
  //変数を引数に割り当てても持ってこれないためサーバーに一度要求し、取ってくる必要がある
  const { posts } = await graphcms.request(SLUGLIST);

  return {
    //複数あることが前提のため、一つ一つ設定していたらきりがないため
    // map関数で設定する
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const slug = params.slug;
  //第二引数に当てはめることで、query postの引数に割り当てることができる
  const data = await graphcms.request(QUERY, { slug });
  const post = data.post;
  return {
    props: {
      post,
    },
  };
}

export default function Home({ post }) {
    return (
        <main className={styles.blog}>
          <h2>{post.title}</h2>
          <img src={post.photo.url} alt="" className={styles.photo} />
          <div className={styles.title}>
            <div className={styles.authorText}>
              <h6>By {post.author.name}</h6>
              <h6 className={styles.date}>{post.datePublished}</h6>
            </div>
          </div>
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content.html }}
          ></div>
          <div className={styles.backButton}>
            <Link href="/">
              <span>←もどる</span>
            </Link>
          </div>
        </main>
      );
    }
