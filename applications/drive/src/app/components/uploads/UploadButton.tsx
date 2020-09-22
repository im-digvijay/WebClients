import React from 'react';
import { c } from 'ttag';

import { classnames, FloatingButton, SidebarPrimaryButton } from 'react-components';

import { useDriveActiveFolder } from '../Drive/DriveFolderProvider';
import useFileUploadInput from '../../hooks/drive/useFileUploadInput';
import { useDownloadProvider } from '../downloads/DownloadProvider';
import { useUploadProvider } from './UploadProvider';

interface Props {
    floating?: boolean;
}

const UploadButton = ({ floating }: Props) => {
    const { folder } = useDriveActiveFolder();
    const { inputRef: fileInput, handleClick, handleChange: handleFileChange } = useFileUploadInput();

    const { downloads } = useDownloadProvider();
    const { uploads } = useUploadProvider();
    const isTransfering = uploads.length > 0 || downloads.length > 0;

    return (
        <>
            <input multiple type="file" ref={fileInput} className="hidden" onChange={handleFileChange} />
            {floating ? (
                <FloatingButton
                    className={classnames([isTransfering && 'compose-fab--is-higher'])}
                    disabled={!folder?.shareId}
                    onClick={handleClick}
                    title={c('Action').t`New upload`}
                    icon="plus"
                />
            ) : (
                <SidebarPrimaryButton disabled={!folder?.shareId} onClick={handleClick}>{c('Action')
                    .t`New upload`}</SidebarPrimaryButton>
            )}
        </>
    );
};

export default UploadButton;
