module wally::posts;

use std::string::String;

const ESenderUnauthorized: u64 = 1;

public struct Post has key, store {
    id: UID,
    title: String,
    body: String,
    author: address,
    published_at: u64,
    updated_at: u64,
}

// fun init(ctx: &mut TxContext) {}

public fun create_post(
    title: String,
    body: String,
    published_at: u64,
    updated_at: u64,
    ctx: &mut TxContext,
): Post {
    let post = Post {
        id: object::new(ctx),
        title,
        body,
        author: ctx.sender(),
        published_at,
        updated_at,
    };

    post
}

public fun delete_post(post: Post, ctx: &mut TxContext) {
    assert!(post.author == ctx.sender(), ESenderUnauthorized);

    let Post { id, .. } = post;

    object::delete(id);
}

public fun update_post(
    post: &mut Post,
    title: String,
    body: String,
    updated_at: u64,
    ctx: &mut TxContext,
) {
    assert!(post.author == ctx.sender(), ESenderUnauthorized);

    post.title = title;
    post.body = body;
    post.updated_at = updated_at;
}
