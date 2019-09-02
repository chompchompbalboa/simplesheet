//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import React from 'react'
import { connect } from 'react-redux'

import { AppState } from '@app/state'
import { ThunkDispatch } from '@app/state/types'
import { Files, Folders } from '@app/state/folder/types'
import { 
  updateActiveFileId as updateActiveFileIdAction,
  updateActiveFolderPath as updateActiveFolderPathAction 
} from '@app/state/folder/actions'
import { selectActiveFileId, selectActiveFolderPath, selectFiles, selectFolders, selectIsSavingNewFile, selectOnFileSave, selectRootFolderIds } from '@app/state/folder/selectors'

import Content from '@app/bundles/Content/Content'
import FoldersFolder from '@app/bundles/Folders/FoldersFolder'
import FoldersHeader from '@app/bundles/Folders/FoldersHeader'
import FoldersSidebar from '@app/bundles/Folders/FoldersSidebar'

//-----------------------------------------------------------------------------
// Redux
//-----------------------------------------------------------------------------
const mapStateToProps = (state: AppState) => ({
  activeFileId: selectActiveFileId(state),
  activeFolderPath: selectActiveFolderPath(state),
  files: selectFiles(state),
  folders: selectFolders(state),
  isSavingNewFile: selectIsSavingNewFile(state),
  onFileSave: selectOnFileSave(state),
  rootFolderIds: selectRootFolderIds(state)
})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  updateActiveFileId: (nextActiveFolderId: string) => dispatch(updateActiveFileIdAction(nextActiveFolderId)),
  updateActiveFolderPath: (level: number, nextActiveFolderId: string) => dispatch(updateActiveFolderPathAction(level, nextActiveFolderId))
})

//-----------------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------------
const Folders = ({
  activeFileId,
  activeFolderPath,
  files,
  folders,
  handleFileOpen,
  isActiveTab,
  isSavingNewFile,
  onFileSave,
  rootFolderIds,
  updateActiveFileId,
  updateActiveFolderPath
}: FoldersProps) => {

  const Sidebar = () => {
    return <FoldersSidebar />
  }

  const Header = () => {
    return (
      <FoldersHeader
        activeFileId={activeFileId}
        activeFolderPath={activeFolderPath}
        files={files}
        folders={folders}
        isSavingNewFile={isSavingNewFile}
        onFileSave={onFileSave}/>
    )
  }

  const FoldersContent = () => {
    return (
      <>
        <FoldersFolder
          activeFileId={activeFileId}
          activeFolderPath={activeFolderPath}
          files={files}
          folderId="ROOT"
          folders={folders}
          handleFileOpen={handleFileOpen}
          level={0}
          rootFolderIds={rootFolderIds}
          updateActiveFileId={updateActiveFileId}
          updateActiveFolderPath={updateActiveFolderPath}/>
        {activeFolderPath.length > 0 && 
          activeFolderPath.map((folderId: string, index: number) => (
            <FoldersFolder 
              key={folderId}
              activeFileId={activeFileId}
              activeFolderPath={activeFolderPath}
              files={files}
              folderId={folderId}
              folders={folders}
              handleFileOpen={handleFileOpen}
              level={index + 1}
              rootFolderIds={rootFolderIds}
              updateActiveFileId={updateActiveFileId}
              updateActiveFolderPath={updateActiveFolderPath}/>))}
      </>
    )
  }

  if(isActiveTab) {
    return (
      <Content
        Sidebar={Sidebar}
        Content={FoldersContent}
        Header={Header}/>
    )
  }
  return null
}

//-----------------------------------------------------------------------------
// Props
//-----------------------------------------------------------------------------
interface FoldersProps {
  activeFileId: string
  activeFolderPath: string[]
  files: Files
  folders: Folders
  handleFileOpen(nextActiveTabId: string): void
  isActiveTab: boolean
  isSavingNewFile: boolean
  onFileSave: () => void
  rootFolderIds: string[]
  updateActiveFileId(nextActiveFileId: string): void
  updateActiveFolderPath(level: number, nextActiveFolderId: string): void
}

//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Folders)
