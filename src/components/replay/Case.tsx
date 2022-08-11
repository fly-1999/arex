import { useRequest } from 'ahooks';
import { Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { FC } from 'react';

import ReplayService from '../../services/Replay.service';
import { ReplayCase } from '../../services/Replay.type';
import { SmallTextButton } from '../styledComponents';

type CaseProps = {
  planItemId: number;
  onClick?: (record: ReplayCase) => void;
};

const Case: FC<CaseProps> = (props) => {
  const columnsCase: ColumnsType<ReplayCase> = [
    {
      title: 'Record ID',
      dataIndex: 'recordId',
    },
    {
      title: 'Index ID',
      dataIndex: 'replayId',
    },
    {
      title: 'Status',
      render: (_, record) => (
        <Tag color={record.diffResultCode ? 'error' : 'success'}>
          {record.diffResultCode ? 'Failed' : 'Success'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      render: (_, record) => [
        <SmallTextButton key='replayLog' title='Replay Log' />,
        <SmallTextButton
          key='detail'
          title='Detail'
          onClick={() => props.onClick && props.onClick(record)}
        />,
      ],
    },
  ];

  const { data: caseData = [], loading } = useRequest(
    () => ReplayService.queryReplayCase({ planItemId: props.planItemId }),
    {
      ready: !!props.planItemId,
      refreshDeps: [props.planItemId],
      cacheKey: 'queryReplayCase',
    },
  );
  return (
    <Table
      size='small'
      rowKey='recordId'
      loading={loading}
      columns={columnsCase}
      dataSource={caseData}
      pagination={false}
    />
  );
};

export default Case;
