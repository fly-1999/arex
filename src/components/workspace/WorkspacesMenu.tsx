import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  GlobalOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import { useRequest } from 'ahooks';
import { Input, message, Select, Tooltip } from 'antd';
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { MenuTypeEnum, PageTypeEnum, RoleEnum } from '../../constant';
import { WorkspaceService } from '../../services/Workspace.service';
import { Workspace } from '../../services/Workspace.type';
import { useStore } from '../../store';
import { TooltipButton } from '../index';

const WorkspacesMenuWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  margin-left: 8px;
  & > div {
    :first-of-type {
      width: 100%;
    }
    display: flex;
    align-items: center;
  }
`;

const WorkspacesMenu = () => {
  const params = useParams();
  const nav = useNavigate();
  const { userInfo, workspaces, setWorkspaces, setPanes, resetPanes } = useStore();
  const [editMode, setEditMode] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [status, setStatus] = useState<'' | 'error'>('');

  const { run: getWorkspaces } = useRequest(
    (to?: { workspaceId: string; workspaceName: string }) =>
      WorkspaceService.listWorkspace({ userName: userInfo!.email as string }),
    {
      ready: !!userInfo?.email,
      onSuccess(data, _params) {
        setWorkspaces(data);
        if (_params.length) {
          reset();
          resetPanes();
          nav(`/${_params[0]!.workspaceId}/workspace/${_params[0]!.workspaceName}`);
        } else if (!params.workspaceId || !params.workspaceName) {
          nav(`/${data[0].id}/workspace/${data[0].workspaceName}/workspaceOverview/${data[0].id}`);
        }
      },
    },
  );

  const handleAddWorkspace = () => {
    if (newWorkspaceName === '') {
      setStatus('error');
      message.error('Please input the name of workspace!');
    } else {
      createWorkspace({
        userName: userInfo!.email as string,
        workspaceName: newWorkspaceName,
      });
    }
  };

  const handleEditWorkspace = () => {
    params.workspaceName &&
      params.workspaceId &&
      setPanes(
        {
          title: params.workspaceName,
          key: params.workspaceId,
          menuType: MenuTypeEnum.Collection,
          pageType: PageTypeEnum.WorkspaceOverview,
          isNew: true,
        },
        'push',
      );
  };

  const { run: createWorkspace } = useRequest(WorkspaceService.createWorkspace, {
    manual: true,
    onSuccess: (res, params) => {
      if (res.success) {
        const workspaceId = res.workspaceId;
        getWorkspaces({ workspaceId, workspaceName: params[0].workspaceName });
      }
    },
  });

  const handleChangeWorkspace = (workspaceId: string) => {
    const label = workspaces.find((i) => i.id === workspaceId)?.workspaceName;
    if (label) {
      resetPanes();
      nav(`/${workspaceId}/workspace/${label}`);
    }
  };

  const reset = () => {
    setEditMode(false);
    setStatus('');
    setNewWorkspaceName('');
  };

  const currentWorkspaceName = useMemo(() => {
    const roleList: { [key: string]: string } = {
      [RoleEnum.Admin]: 'Admin',
      [RoleEnum.Editor]: 'Editor',
      [RoleEnum.Viewer]: 'Viewer',
    };
    const currentWorkspace =
      workspaces.find((i) => i.id === params.workspaceId) || ({} as Workspace);
    const role = workspaces.find((i) => i.id === params.workspaceId)?.role;
    const roleName = roleList[role || RoleEnum.Viewer];
    return currentWorkspace.workspaceName ? `${currentWorkspace.workspaceName} - ${roleName}` : '';
  }, [params.workspaceId, workspaces]);

  return (
    <WorkspacesMenuWrapper>
      <div>
        <Tooltip title='Current Workspace'>
          <GlobalOutlined />
        </Tooltip>
        {editMode ? (
          <Input
            size='small'
            value={newWorkspaceName}
            status={status}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            style={{ marginLeft: '10px', width: '80%' }}
          />
        ) : (
          <Select
            size='small'
            bordered={false}
            value={params.workspaceId}
            options={workspaces.map((ws) => ({
              value: ws.id,
              label: ws.workspaceName,
            }))}
            onChange={handleChangeWorkspace}
            style={{ width: '80%' }}
          />
        )}
      </div>

      <div>
        {editMode ? (
          <>
            <TooltipButton icon={<CheckOutlined />} title='OK' onClick={handleAddWorkspace} />
            <TooltipButton icon={<CloseOutlined />} title='Cancel' onClick={reset} />
          </>
        ) : (
          <TooltipButton
            icon={<PlusOutlined />}
            title='Add Workspace'
            onClick={() => setEditMode(true)}
          />
        )}

        <TooltipButton
          icon={<EditOutlined />}
          title='Edit Workspace'
          onClick={handleEditWorkspace}
        />
        <TooltipButton icon={<UploadOutlined />} title='Import' />
      </div>
    </WorkspacesMenuWrapper>
  );
};

export default WorkspacesMenu;