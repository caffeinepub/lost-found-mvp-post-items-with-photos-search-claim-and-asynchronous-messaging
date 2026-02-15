import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let items = Map.empty<Text, Item>();
  let conversations = Map.empty<Text, Conversation>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let feedbackEntries = Map.empty<Nat, FeedbackEntry>();

  var nextItemId = 0;
  var nextMessageId = 0;
  var nextConversationId = 0;
  var nextFeedbackId = 0;

  public type ItemType = {
    #lost;
    #found;
  };

  public type Status = {
    #missing;
    #claimed;
    #returned;
  };

  public type Item = {
    id : Text;
    itemType : ItemType;
    title : Text;
    description : Text;
    category : Text;
    location : Text;
    dateTime : Text;
    photo : ?Storage.ExternalBlob;
    createdBy : Principal;
    status : Status;
    createdAt : Time.Time;
  };

  public type Message = {
    id : Text;
    sender : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type Conversation = {
    id : Text;
    itemId : Text;
    participants : [Principal];
    messages : [Message];
  };

  public type UserProfile = {
    name : Text;
  };

  public type FeedbackEntry = {
    id : Nat;
    user : Principal;
    message : Text;
    createdAt : Time.Time;
  };

  // Include Authorization and Storage Mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Feedback Management
  public shared ({ caller }) func submitFeedback(message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit feedback");
    };
    let newFeedback : FeedbackEntry = {
      id = nextFeedbackId;
      user = caller;
      message;
      createdAt = Time.now();
    };
    feedbackEntries.add(nextFeedbackId, newFeedback);
    nextFeedbackId += 1;
  };

  public query ({ caller }) func getAllFeedback() : async [FeedbackEntry] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access all feedback");
    };
    let allFeedback = List.empty<FeedbackEntry>();
    for ((_, entry) in feedbackEntries.entries()) {
      allFeedback.add(entry);
    };
    allFeedback.toArray();
  };

  public query ({ caller }) func getCallerFeedback() : async [FeedbackEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access feedback");
    };
    let feedbackForCaller = List.empty<FeedbackEntry>();
    for ((_, entry) in feedbackEntries.entries()) {
      if (entry.user == caller) {
        feedbackForCaller.add(entry);
      };
    };
    feedbackForCaller.toArray();
  };

  // Item Management
  public shared ({ caller }) func createItem(itemType : ItemType, title : Text, description : Text, category : Text, location : Text, dateTime : Text, photo : ?Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create items");
    };

    let itemId = nextItemId.toText();
    nextItemId += 1;

    let newItem : Item = {
      id = itemId;
      itemType;
      title;
      description;
      category;
      location;
      dateTime;
      photo;
      createdBy = caller;
      status = #missing;
      createdAt = Time.now();
    };

    items.add(itemId, newItem);
    itemId;
  };

  public query ({ caller }) func getItem(itemId : Text) : async ?Item {
    // Public read access - no authentication required
    items.get(itemId);
  };

  public query ({ caller }) func searchItems(keyword : Text, category : ?Text, itemType : ?ItemType) : async [Item] {
    // Public search access - no authentication required
    let results = List.empty<Item>();

    for ((_, item) in items.entries()) {
      if (item.title.toLower().contains(#text (keyword.toLower())) or item.description.toLower().contains(#text (keyword.toLower()))) {
        let categoryMatches = switch (category) {
          case (null) { true };
          case (?cat) { item.category == cat };
        };

        let typeMatches = switch (itemType) {
          case (null) { true };
          case (?t) { item.itemType == t };
        };

        if (categoryMatches and typeMatches) {
          results.add(item);
        };
      };
    };
    results.toArray();
  };

  public shared ({ caller }) func updateItemStatus(itemId : Text, newStatus : Status) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update items");
    };

    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (item.createdBy != caller) {
          Runtime.trap("Unauthorized: Only the creator can update the status");
        };
        let updatedItem : Item = {
          item with status = newStatus;
        };
        items.add(itemId, updatedItem);
      };
    };
  };

  // Conversation Management
  public shared ({ caller }) func createConversation(itemId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create conversations");
    };

    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (item.createdBy == caller) {
          Runtime.trap("Unauthorized: Cannot create conversation with yourself");
        };

        // Check if conversation already exists between these participants
        for ((_, conv) in conversations.entries()) {
          if (conv.itemId == itemId) {
            let hasOwner = conv.participants.find(func(p) { p == item.createdBy });
            let hasCaller = conv.participants.find(func(p) { p == caller });
            if (hasOwner != null and hasCaller != null) {
              return conv.id; // Return existing conversation
            };
          };
        };

        let conversationId = nextConversationId.toText();
        nextConversationId += 1;

        let newConversation : Conversation = {
          id = conversationId;
          itemId;
          participants = [item.createdBy, caller];
          messages = [];
        };

        conversations.add(conversationId, newConversation);
        conversationId;
      };
    };
  };

  public shared ({ caller }) func sendMessage(conversationId : Text, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    switch (conversations.get(conversationId)) {
      case (null) { Runtime.trap("Conversation not found") };
      case (?conv) {
        // Verify caller is a participant
        let isParticipant = conv.participants.find(func(p) { p == caller });
        if (isParticipant == null) {
          Runtime.trap("Unauthorized: Only conversation participants can send messages");
        };

        let newMessage : Message = {
          id = nextMessageId.toText();
          sender = caller;
          content = message;
          timestamp = Time.now();
        };

        var messagesList = List.fromArray<Message>(conv.messages);
        messagesList.add(newMessage);

        let updatedConv : Conversation = {
          conv with messages = messagesList.toArray<Message>();
        };
        conversations.add(conversationId, updatedConv);

        nextMessageId += 1;
      };
    };
  };

  public query ({ caller }) func getConversation(conversationId : Text) : async ?Conversation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    switch (conversations.get(conversationId)) {
      case (null) { null };
      case (?conv) {
        // Verify caller is a participant
        let isParticipant = conv.participants.find(func(p) { p == caller });
        if (isParticipant == null) {
          Runtime.trap("Unauthorized: Only conversation participants can view this conversation");
        };
        ?conv;
      };
    };
  };

  public query ({ caller }) func getUserConversations(user : Principal) : async [Conversation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own conversations");
    };

    let results = List.empty<Conversation>();
    for ((_, conv) in conversations.entries()) {
      let isParticipant = conv.participants.find(func(p) { p == user });
      if (isParticipant != null) {
        results.add(conv);
      };
    };
    results.toArray();
  };
};
