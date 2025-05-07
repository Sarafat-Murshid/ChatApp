import React, { useState } from 'react';

interface FriendSearchProps {
  onAddFriend: (friendId: string) => void;
}

const FriendSearch: React.FC<FriendSearchProps> = ({ onAddFriend }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const handleSearch = async () => {
    // Replace with your API endpoint for searching users
    const response = await fetch(`/api/search-users?query=${searchQuery}`);
    const results = await response.json();
    setSearchResults(results);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search for friends..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {searchResults.map((user) => (
          <li key={user}>
            {user} <button onClick={() => onAddFriend(user)}>Add Friend</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendSearch;