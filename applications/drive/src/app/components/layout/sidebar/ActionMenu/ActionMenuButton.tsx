import { PropsWithChildren } from 'react';

import { c } from 'ttag';

import {
    Dropdown,
    DropdownMenu,
    DropdownSizeUnit,
    Icon,
    SidebarPrimaryButton,
    usePopperAnchor,
} from '@proton/components';
import { getDevice } from '@proton/shared/lib/helpers/browser';
import clsx from '@proton/utils/clsx';

import { CreateNewFolderButton, UploadFileButton, UploadFolderButton } from './ActionMenuButtons';

interface Props {
    disabled?: boolean;
    className?: string;
}
export const ActionMenuButton = ({ disabled, className }: PropsWithChildren<Props>) => {
    const { anchorRef, isOpen, toggle, close } = usePopperAnchor<HTMLButtonElement>();
    const isDesktop = !getDevice()?.type;

    return (
        <>
            <SidebarPrimaryButton
                ref={anchorRef}
                disabled={disabled}
                className={clsx(className, 'flex flex-justify-center flex-align-items-center')}
                onClick={toggle}
            >
                <Icon className="mr0-5" name="plus" />
                {
                    // translator: this string is used on Proton Drive to open a drop-down with 3 actions: Upload file, folder and new folder
                    c('Action').t`New`
                }
            </SidebarPrimaryButton>
            <Dropdown
                size={{ width: DropdownSizeUnit.Anchor, height: DropdownSizeUnit.Dynamic }}
                isOpen={isOpen}
                anchorRef={anchorRef}
                onClose={close}
                // Here we don't autoClose the dropdown because the input elements will get dismounted
                autoClose={false}
            >
                <DropdownMenu className="mt0-25 mb0-25">
                    <UploadFileButton onUploadStarted={close} />
                    {isDesktop && <UploadFolderButton onUploadStarted={close} />}
                    <hr className="mt0-5 mb0-5" />
                    <CreateNewFolderButton />
                </DropdownMenu>
            </Dropdown>
        </>
    );
};

export default ActionMenuButton;
