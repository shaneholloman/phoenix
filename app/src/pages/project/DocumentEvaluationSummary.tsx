import { startTransition, Suspense, useEffect } from "react";
import { graphql, useLazyLoadQuery, useRefetchableFragment } from "react-relay";
import { useParams } from "react-router";

import { Flex, Text } from "@phoenix/components";
import { useTimeRange } from "@phoenix/components/datetime";
import { useStreamState } from "@phoenix/contexts/StreamStateContext";

import { DocumentEvaluationSummaryQuery } from "./__generated__/DocumentEvaluationSummaryQuery.graphql";
import { DocumentEvaluationSummaryValueFragment$key } from "./__generated__/DocumentEvaluationSummaryValueFragment.graphql";
import { RetrievalEvaluationLabel } from "./RetrievalEvaluationLabel";

type DocumentEvaluationSummaryProps = {
  evaluationName: string;
};
export function DocumentEvaluationSummary({
  evaluationName,
}: DocumentEvaluationSummaryProps) {
  const { projectId } = useParams();
  const { timeRange } = useTimeRange();
  const data = useLazyLoadQuery<DocumentEvaluationSummaryQuery>(
    graphql`
      query DocumentEvaluationSummaryQuery(
        $evaluationName: String!
        $id: ID!
        $timeRange: TimeRange!
      ) {
        project: node(id: $id) {
          ...DocumentEvaluationSummaryValueFragment
            @arguments(evaluationName: $evaluationName, timeRange: $timeRange)
        }
      }
    `,
    {
      id: projectId as string,
      evaluationName,
      timeRange: {
        start: timeRange?.start?.toISOString(),
        end: timeRange?.end?.toISOString(),
      },
    }
  );
  return (
    <Flex direction="column" flex="none">
      <Text elementType="h3" size="S" color="text-700">
        {evaluationName}
      </Text>
      <Suspense fallback={<Text size="L">--</Text>}>
        <EvaluationSummaryValue
          evaluationName={evaluationName}
          project={data?.project}
        />
      </Suspense>
    </Flex>
  );
}

function EvaluationSummaryValue(props: {
  evaluationName: string;
  project: DocumentEvaluationSummaryValueFragment$key;
}) {
  const { project } = props;
  const { fetchKey } = useStreamState();
  const [data, refetch] = useRefetchableFragment<
    DocumentEvaluationSummaryQuery,
    DocumentEvaluationSummaryValueFragment$key
  >(
    graphql`
      fragment DocumentEvaluationSummaryValueFragment on Project
      @refetchable(queryName: "DocumentEvaluationSummaryValueQuery")
      @argumentDefinitions(
        evaluationName: { type: "String!" }
        timeRange: { type: "TimeRange!" }
      ) {
        documentEvaluationSummary(
          evaluationName: $evaluationName
          timeRange: $timeRange
        ) {
          averageNdcg
          averagePrecision
          meanReciprocalRank
          hitRate
        }
      }
    `,
    project
  );

  // Refetch the evaluation summary if the fetchKey changes
  useEffect(() => {
    startTransition(() => {
      refetch({}, { fetchPolicy: "store-and-network" });
    });
  }, [fetchKey, refetch]);

  const averageNdcg = data?.documentEvaluationSummary?.averageNdcg;
  const averagePrecision = data?.documentEvaluationSummary?.averagePrecision;
  const hitRate = data?.documentEvaluationSummary?.hitRate;

  return (
    <Flex direction="row" alignItems="center" gap="size-50" height="28px">
      <>
        <RetrievalEvaluationLabel
          key="ndcg"
          metric="ndcg"
          score={averageNdcg}
        />
        <RetrievalEvaluationLabel
          key="precision"
          metric="precision"
          score={averagePrecision}
        />
        <RetrievalEvaluationLabel key="hit" metric="hit rate" score={hitRate} />
      </>
    </Flex>
  );
}
