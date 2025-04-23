import gql from 'graphql-tag';

export const MOVIES_MOBILE_SEARCH_QUERY = gql`
    query GetMovies($input: GetMoviesInput!) {
        movies(input: $input) {
            data {
                _id
                name
                originName
                posterUrl
                thumbUrl
                episodeCurrent
                slug
                year
                quality
                contentRating
                content
                time
                lang
                view
                type
                countries {
                    name
                    slug
                }
                categories {
                    name
                    slug
                }
            }
            total
        }
    }
`;
