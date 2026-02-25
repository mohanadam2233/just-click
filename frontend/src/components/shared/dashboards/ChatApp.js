import Conversation from "./Conversation";
import CoversationPartner from "./CoversationPartner";

const ChatApp = () => {
  return (
    <div>
      <div className="mb-15px">
        <h2 className="text-2xl md:text-size-28 font-bold text-blackColor dark:text-blackColor-dark">
          Messages
        </h2>
      </div>
      {/* message body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-30px">
        {/* participant */}
        <CoversationPartner />
        {/* conversation */}
        <Conversation />
      </div>
    </div>
  );
};

export default ChatApp;
