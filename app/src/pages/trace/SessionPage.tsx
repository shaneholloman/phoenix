import React from "react";
import { useLoaderData, useNavigate, useParams } from "react-router";

import { Dialog, DialogContainer } from "@arizeai/components";

import { ErrorBoundary } from "@phoenix/components";
import { useProjectRootPath } from "@phoenix/hooks/useProjectRootPath";

import { sessionLoaderQuery$data } from "./__generated__/sessionLoaderQuery.graphql";
import { SessionDetails } from "./SessionDetails";

/**
 * A component that shows the details of a session
 */
export function SessionPage() {
  const loaderData = useLoaderData() as sessionLoaderQuery$data;
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { rootPath } = useProjectRootPath();
  return (
    <DialogContainer
      type="slideOver"
      isDismissable
      onDismiss={() => navigate(`${rootPath}/sessions`)}
    >
      <Dialog
        size="fullscreen"
        title={`Session ID: ${loaderData.session?.sessionId ?? "--"}`}
      >
        <ErrorBoundary>
          <SessionDetails sessionId={sessionId as string} />
        </ErrorBoundary>
      </Dialog>
    </DialogContainer>
  );
}
