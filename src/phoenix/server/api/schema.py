import strawberry

from phoenix.server.api.exceptions import get_mask_errors_extension
from phoenix.server.api.mutations import Mutation
from phoenix.server.api.queries import Query
from phoenix.server.api.subscriptions import Subscription

# This is the schema for generating `schema.graphql`.
# See https://strawberry.rocks/docs/guides/schema-export
# It should be kept in sync with the server's runtime-initialized
# instance. To do so, search for the usage of `strawberry.Schema(...)`.
schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    extensions=[get_mask_errors_extension()],
    subscription=Subscription,
)
