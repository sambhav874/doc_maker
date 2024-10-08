'use client'
import { RoomProvider, ClientSideSuspense } from '@liveblocks/react/suspense';
import React, { useEffect, useRef, useState } from 'react';
import { Editor } from './editor/Editor';
import Header from './Header';
import Loader from './Loader';
import ActiveCollaborators from './ActiveCollaborators';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SignedOut, SignInButton, SignedIn, UserButton } from '@clerk/nextjs';
import { updateDocument } from '@/lib/actions/room.actions';
import ShareModal from './ShareModal';
import { LiveList, LiveMap, LiveObject } from '@liveblocks/client';

const CollaborativeRoom = ({ roomId, roomMetadata , users , currentUserType }: CollaborativeRoomProps) => {
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        setLoading(true);

        try{
            if(documentTitle !== roomMetadata.title){
                const updatedDocument = await updateDocument(roomId , documentTitle);

                if(updatedDocument){
                    setEditing(false);
                }
            }
        }catch(error){
            console.log(error);
        }
      
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setEditing(false);
        updateDocument(roomId , documentTitle);
      }
      
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [roomId , documentTitle]);

  useEffect(() => {
    if(editing && inputRef.current){
        inputRef.current.focus();
    }
  } , [editing])

  return (
    <RoomProvider initialStorage={{
      title: roomMetadata.title || 'Untitled',
      content: new LiveObject({ text: '' }), // Initial content of the editor
    
    }} id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header>
            <div ref={containerRef} className="flex w-fit items-center text-sm justify-center md:gap-2 gap-0 ">
              {editing && !loading ? (
                <Input
                  type="text"
                  value={documentTitle}
                  ref={inputRef}
                  placeholder="Enter Title"
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  onKeyDown={updateTitleHandler}
                  className="document-title-input"
                />
              ) : (
                <p className="document-title text-sm md:text-xl ">{documentTitle}</p>
              )}
              {currentUserType === 'editor' && !editing && (
                <Button
                  className="flex items-center hover:bg-white hover:text-dark-200 text-white md:space-x-1 p-2 pointer"
                  onClick={() => setEditing(true)}
                >
                  <FontAwesomeIcon icon={faEdit} className="hover:text-dark-200 text-xl font-light h-4 w-4" />
                </Button>
              )}
              {currentUserType !== 'editor' && !editing && <p className="view-only-tag">View Only</p>}
              {loading && <p className="text-sm text-gray-400">Saving...</p>}
              
            </div>
            <div className="flex w-full flex-1 justify-end gap-0 md:gap-3">
            <ActiveCollaborators />
            
              <ShareModal
              roomId={roomId} collaborators={users} currentUserType={currentUserType} creatorId={roomMetadata.creatorId} />

            <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>

              </div>
          </Header>
          <div className="flex min-h-screen w-full bg-dark-100 px-2 py-4 fixed">
            <div className="flex w-full  bg-slate-900 text-black rounded-lg shadow-lg">
              <div className="w-full">
                <Editor roomId={roomId} currentUserType={currentUserType} />
              </div>
            </div>
          </div>
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;
