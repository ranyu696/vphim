#### *UC-1: Search and Browse Movies*

| Field | Description |
| :---- | :---- |
| Use Case Name | Search Movies |
| Use Case ID | UC-1 |
| Description | A user wants to find a movie to watch, either by browsing available titles or searching for a specific movie. |
| Actor | User (Guest or Member) |
| Organizational Benefits | Helps users quickly and easily find movies they are interested in, enhancing user experience and encouraging engagement. |
| Triggers | \- User visits the VePhim homepage. \- User enters a search query in the search bar. |
| Preconditions | Users have access to the VePhim website. |
| Postconditions | A list of movies matching the user's browsing or search criteria is displayed. |
| Main Course | 1\. User navigates to the VePhim website. 2\. User either browses movie categories or enters a search query in the search bar. 3\. The system displays a list of movies matching the criteria. 4\. User selects a movie to view its details. |
| Alternate Courses | **AC1: User Search** \- If the initial search results do not meet the user's needs, they can refine their search by using filters (type, release year, etc.) or modifying their search query. \- The system updates the displayed movie list accordingly.  **AC2: Filter by Entity** \- User can filter movies by clicking on entities like actors, directors, or categories. \- System creates appropriate search parameters and displays filtered results. **AC3: Sorting Results** \- User can sort results by various criteria (best match, newest, oldest, trending, recently updated). \- System reorders the displayed movies according to the selected sort option. |
| Exceptions | **EX1: No Matching Movies Found** \- If no movies match the user's browsing or search criteria, the system displays a message indicating that no results were found. \- The user can try modifying their search or browsing other categories. **EX2: Search Service Unavailable** \- If the search service is unavailable, the system displays an error message. \- User is prompted to try again later. |

## 

## 

## 

## 

#### *UC-2: Watch Movies*

| Field | Description |
| :---- | :---- |
| Use Case Name | Watch Movies |
| Use Case ID | UC-2 |
| Description | A user wants to watch a movie or TV show episode. |
| Actor | User (Guest or Member) |
| Organizational Benefits | Provides core functionality for movie watching. |
| Triggers | \- User clicks on the play button for a movie \- User selects a movie episode from a series \- User clicks on "Continue Watching" for a previously started movie |
| Preconditions | \- User has access to the VePhim website \- The selected movie is available for watching |
| Postconditions | \- Movie playback begins \- Viewing history is updated \- Watch progress is saved |
| Main Course | 1\. User selects a movie to watch 2\. System loads the video player 3\. System begins streaming the selected content 4\. User watches the movie 5\. System periodically saves watching progress |
| Alternate Courses | **AC1: Resume Playback** \- If user has previously watched part of the movie \- System offers to resume from last watched position \- User can choose to resume or start from beginning  **AC2: Playback Controls** \- User can pause, play, seek, or adjust volume \- System responds to playback control commands \- Playback state is updated accordingly  |
| Exceptions | **EX1: Streaming Error** \- If video streaming fails \- System displays error message \- Offers retry option or alternative streaming sources  **EX2: Network Issues** \- If user's internet connection is unstable \- System attempts to adjust quality automatically \- Displays network warning if needed \- Saves last watched position |

## 

## 

## 

#### *UC-3: Login/Authentication*

| Field | Description |
| :---- | :---- |
| Use Case Name | User Login/Authentication |
| Use Case ID | UC-003 |
| Description | A guest user wants to create an account or an existing user wants to login to access advanced features. |
| Actor | User (Guest or Member) |
| Organizational Benefits | Enables personalized user experiences, data collection for improvements. |
| Triggers | \- User clicks on the "LogIn" button. \- User attempts to access a feature that requires authentication. |
| Preconditions | \- User has internet access and is on the VePhim platform. |
| Postconditions | \- User is authenticated and logged into their account. \- User can access advanced features. |
| Main Course | 1\. User clicks on the "LogIn" button. 2\. User enters required information (email). 3\. System sends a one-time password (OTP) or magic link via email. 4\. Users verify their identity through the OTP or link. 5\. System creates or authenticates the account and logs the user in. 6\. Users are redirected to the homepage or their intended destination. |
| Alternate Courses | **AC1: Social Media Login** \- Users choose to log in with a social media account (Google, GitHub). \- System authenticates through the selected provider. \- User accounts are created or accessed using the social credentials. **AC2: Auto-Creation for New Users** \- If a user attempts to log in with an email not in the system, a new account is automatically created. \- The system assigns default values and sends verification. **AC3: Session Refresh** \- When the user's access token expires but the refresh token is valid. \- System silently obtains a new access token without requiring re-authentication. |
| Exceptions | **EX1: Authentication Failure** \- If authentication fails (incorrect OTP, expired link), the system displays an error message. \- Users can request a new OTP or link. **EX2: Blocked Account** \- If the user account has been blocked, the system notifies the user. \- Users are prompted to contact support. **EX3: Social Provider Error** \- If authentication with a social provider fails, the system displays an error message. \- Users can try again or use email-based authentication. |

## 

## 

## 

#### *UC-4: AI-Powered Movie Search*

| Field | Description |
| :---- | :---- |
| Use Case Name | AI-Powered Movie Search |
| Use Case ID | UC-4 |
| Description | A user wants to find a movie using natural language or descriptive queries processed by the Gemini AI assistant. |
| Actor | Member |
| Organizational Benefits | Provides a more intuitive search experience, improving user satisfaction and enabling discovery of content that might be missed with traditional search. |
| Triggers | \- User clicks on the AI search option. \- User enters a natural language query in the AI search box. \- User toggles the AI search mode. |
| Preconditions | \- Users have access to the VePhim website. \- Users must be logged in to their account |
| Postconditions | A list of movies recommended by the AI based on the user's query is displayed. |
| Main Course | 1\. User navigates to the AI search feature. 2\. User enters a natural language query (e.g., "show me action movies with strong female leads" or "something similar to Inception"). 3\. The system processes the query through Gemini AI. 4\. The system displays a list of recommended movies. 5\. User selects a movie to view its details. |
| Alternate Courses | **AC1: Refining AI Search** \- If the initial recommendations don't meet the user's expectations, they can refine their query with additional details. **AC2: Combined Filters with AI** \- Users can combine AI search with traditional filters (year, categories, etc.). \- System uses both AI analysis and filter constraints to deliver more targeted results. |
| Exceptions | **EX1: AI Service Unavailable** \- If the AI service is unavailable, the system falls back to standard search and notifies the user. \- The user can proceed with traditional search methods. **EX2: Rate Limiting** \- If the user exceeds AI query limits, the system notifies them and suggests traditional search. \- Users can try again after a cooling period. |

## 

## 

## 

## 

#### *UC-5: Watch Movies (High Quality & Ads-Free)*

| Field | Description |
| :---- | :---- |
| Use Case Name | Watch Movies (High Quality & Ads-Free) |
| Use Case ID | UC-5 |
| Description | A user wants to watch a movie or TV show episode with high quality or ads-free |
| Actor | Member |
| Organizational Benefits | Provides core functionality for movie watching. |
| Triggers | \- User choose a movie with High Quality or enable the Ads-free feature. \- User clicks on the play button for a movie \- User selects a movie episode from a series \- User clicks on "Continue Watching" for a previously started movie |
| Preconditions | \- Users must be logged in to their account \- User has access to the VePhim website \- The selected movie is available for watching |
| Postconditions | \- Movie playback begins \- Viewing history is updated \- Watch progress is saved \- Ads is removed from movie |
| Main Course | 1\. User selects a movie to watch 2\. System loads the video player 3\. System remove the ads from movie 4\. System begins streaming the selected content 5\. User watches the movie 6\. System periodically saves watching progress |
| Alternate Courses | **AC1: Resume Playback** \- If user has previously watched part of the movie \- System offers to resume from last watched position \- User can choose to resume or start from beginning  **AC2: Playback Controls** \- User can pause, play, seek, or adjust volume \- System responds to playback control commands \- Playback state is updated accordingly  |
| Exceptions | **EX1: Streaming Error** \- If video streaming fails \- System displays error message \- Offers retry option or alternative streaming sources  **EX2: Network Issues** \- If user's internet connection is unstable \- System attempts to adjust quality automatically \- Displays network warning if needed \- Saves last watched position |

## 

## 

## 

#### *UC-6.1: Follow Movie*

| Field | Description |
| :---- | :---- |
| Use Case Name | Follow movie |
| Use Case ID | UC-6.1 |
| Description | A registered user wants to save content to their favorites list for easy access later. |
| Actor | Member |
| Organizational Benefits | Increases user retention by allowing users to create personalized collections and encouraging return visits. |
| Triggers | \- User clicks "Add to Favorites" or heart icon on content. \- User accesses their following list. |
| Preconditions | \- User is logged into their account. |
| Postconditions | \- Content is added to the user's following list. \- User can view their updated following list. |
| Main Course | 1\. User finds a movie or TV show they want to save. 2\. User clicks the "Add to Favorites" or heart icon. 3\. System adds the content to the user's favorites list. 4\. System confirms the action with visual feedback (e.g., filled heart icon). 5\. User can access their favorites from their profile or dedicated section. |
| Alternate Courses | **AC1: Cross-Platform Synchronization** \- User adds content to favorites on one device. \- System synchronizes favorites across all user's devices. |
| Exceptions | **EX1: Authentication Required** \- If a guest user attempts to add content to favorites, the system prompts for login or registration. \- After authentication, the system completes the original favorite action.  |

#### *UC-6.2: Unfollow Movie*

| Field | Description |
| :---- | :---- |
| Use Case Name | Unfollow movie |
| Use Case ID | UC-6.2 |
| Description | A registered user wants remove content from their favorites list. |
| Actor | Member |
| Organizational Benefits | Increases user retention by allowing users to manage personalized collections. |
| Triggers | \- User clicks "Remove from Favorites" or heart filled icon on content. \- User accesses their following list. |
| Preconditions | \- User is logged into their account. |
| Postconditions | \- Content is remove from the user's following list. \- User can view their updated following list. |
| Main Course | 1\. User finds a movie or TV show they want to remove. 2\. User clicks the "Remove from Favorites" or heart filled icon. 3\. System remove the content from the user's favorites list. 4\. System confirms the action with visual feedback (e.g., unfilled heart icon). 5\. User can access their favorites from their profile or dedicated section. |
| Alternate Courses | **AC1: Cross-Platform Synchronization** \- User remove content to favorites on one device. \- System synchronizes favorites across all user's devices. |
| Exceptions | **EX1: Content No Longer Available** \- If favorited content is later removed from the platform, it remains in favorites but is marked as unavailable. \- User is notified when accessing unavailable content.  |

## 

## 

#### *UC-7.1: View Account Information*

| Field | Description |
| :---- | :---- |
| Use Case Name | View Account Information |
| Use Case ID | UC-7.1 |
| Description | A registered user wants to view their account information. |
| Actor | Member |
| Organizational Benefits | Provides transparency and control over user data, increasing trust and user satisfaction. |
| Triggers | \- User clicks on their profile or avatar \- User selects "Account Settings" or "Profile" \- User accesses account information section |
| Preconditions | \- User is logged into their account |
| Postconditions | \- User can view their current account information \- System displays all relevant account details |
| Main Course | 1\. User navigates to account settings or profile section 2\. System retrieves user's account information 3\. System displays user's profile information (name, email, avatar) 4\. System shows account preferences and settings 5\. User can access their viewing favorites |
| Alternate Courses | **AC1: View from Different Devices** \- User accesses account information from different devices \- System displays consistent information across all platforms |
| Exceptions | **EX1: Session Expired** \- If user's session expires while viewing information \- System prompts user to re-authenticate \- After login, returns to the account information page **EX2: Data Loading Error** \- If system fails to retrieve account information \- System displays error message \- Provides refresh option to retry loading data |

## 

## 

## 

## 

#### *UC-7.2: Update Account Information*

| Field | Description |
| :---- | :---- |
| Use Case Name | Update Account Information |
| Use Case ID | UC-7.2 |
| Description | A registered user wants to modify their account information, including profile details, preferences, and settings. |
| Actor | Member |
| Organizational Benefits | Enables users to maintain accurate account information and customize their experience, leading to increased user satisfaction and engagement. |
| Triggers | \- User clicks "Edit Profile" or "Update" button \- User modifies any account setting or preference \- User initiates profile information change |
| Preconditions | \- User is logged into their account \- User has accessed their account informations |
| Postconditions | \- Account information is updated with new values \- System confirms successful update \- Changes are reflected across all user's devices |
| Main Course | 1\. User accesses account settings or profile section 2\. User selects information to update 3\. System displays editable fields with current values 4\. User modifies desired information 5\. User submits changes 6\. System validates the updates 7\. System saves the changes 8\. System confirms successful update with visual feedback |
| Alternate Courses | **AC1: Avatar Update** \- User selects new avatar image \- System validates image format and size \- System processes and stores new avatar \- Updates display across platform |
| Exceptions | **EX1: Invalid Information** \- If submitted information fails validation \- System highlights invalid fields \- Provides specific error messages \- User can correct and resubmit **EX2: Update Failure** \- If system fails to save changes \- System preserves user's input \- Displays error message \- Offers retry option |

#### *UC-8.1: Post Own Comment*

| Field | Description |
| :---- | :---- |
| Use Case Name | Post Own Comment |
| Use Case ID | UC-8.1 |
| Description | A registered user wants to post a new comment on a movie or TV show. |
| Actor | Member |
| Organizational Benefits | Increases user engagement, provides valuable feedback, and enhances community interaction on the platform. |
| Triggers | \- User clicks "Add Comment" or similar button \- User accesses the comments section of content |
| Preconditions | \- User is logged into their account \- User is viewing a movie detail page |
| Postconditions | \- New comment is posted and visible in the comments section \- Comment appears with user's name and timestamp \- Other users can view and reply to the comment |
| Main Course | 1\. User navigates to movie or TV show detail page 2\. User scrolls to comments section 3\. User clicks "Add Comment" button 4\. System displays comment input field 5\. User types their comment 6\. User clicks "Post" or "Submit" button 7\. System validates the comment 8\. System saves and displays the new comment |
| Alternate Courses | **AC1: Reply to Existing Comment** \- User clicks "Reply" on an existing comment \- System provides reply input field \- User submits reply \- System displays reply as nested comment  |
| Exceptions | **EX1: Rate Limiting** \- If user posts too frequently \- System enforces cooldown period \- Displays time until next allowed comment **EX2: Connection Error** \- If submission fails due to connection \- System preserves comment text \- Allows retry when connection restored |

#### *UC-8.2: Edit Own Comment*

| Field | Description |
| :---- | :---- |
| Use Case Name | Edit Own Comment |
| Use Case ID | UC-8.2 |
| Description | A registered user wants to modify their existing comment on a movie or TV show. |
| Actor | Member |
| Organizational Benefits | Allows users to maintain accurate and appropriate comments, improving content quality and user satisfaction. |
| Triggers | \- User clicks "Edit" button on their own comment \- User selects edit option from comment menu |
| Preconditions | \- User is logged into their account \- User has previously posted the comment \- Comment exists and is editable |
| Postconditions | \- Comment is updated with new content \- Edit timestamp is added to comment \- Original comment thread structure is maintained |
| Main Course | 1\. User locates their existing comment 2\. User clicks edit button or option 3\. System displays editable comment field with current content 4\. User modifies comment text 5\. User clicks "Save" or "Update" button 6\. System validates modified comment 7\. System updates the comment 8\. System displays edited indicator and timestamp |
| Alternate Courses | AC2: Cancel Edit \- User clicks "Cancel" during edit \- System discards changes \- Returns to original comment display  |
| Exceptions | **EX1: Connection Error** \- If submission fails due to connection \- System preserves comment text \- Allows retry when connection restored |

#### *UC-8.3: Remove Own Comment*

| Field | Description |
| :---- | :---- |
| Use Case Name | Remove Own Comment |
| Use Case ID | UC-8.3 |
| Description | A registered user wants to delete their existing comment from a movie or TV show. |
| Actor | Member |
| Organizational Benefits | Enables users to maintain their content presence and remove unwanted comments, improving user control and platform quality. |
| Triggers | \- User clicks "Delete" button on their own comment \- User selects delete option from comment menu |
| Preconditions | \- User is logged into their account \- User has previously posted the comment \- Comment exists and is deletable |
| Postconditions | \- Comment is removed from the platform \- Comment thread is appropriately restructured |
| Main Course | 1\. User locates their existing comment 2\. User clicks delete button or option 3\. System displays confirmation dialog 4\. User confirms deletion 5\. System removes the comment 6\. System updates the comment section display 7\. System shows temporary confirmation message |
| Alternate Courses | **AC1: Delete with Replies** \- Comment has existing replies \- System delete replies \- System restructures thread accordingly **AC2: Cancel Deletion** \- User clicks "Cancel" in confirmation dialog \- System aborts deletion \- Returns to normal comment display |
| Exceptions | **EX1: Network Error** \- If deletion fails due to connection \- System retains comment \- Displays error message with retry option |

#### *UC-9.1: Create Movie*

| Field | Description |
| :---- | :---- |
| Use Case Name | Create Movie |
| Use Case ID | UC-9.1 |
| Description | An administrator adds a new movie to the platform with all necessary information and metadata. |
| Actor | Administrator |
| Organizational Benefits | Expands the content library and keeps the platform updated with new movies, increasing user engagement and platform value. |
| Triggers | \- Admin clicks "Add New Movie" button \- Admin initiates movie creation process |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has content management privileges |
| Postconditions | \- New movie is added to the database \- Movie is indexed for search \- Movie appears in appropriate categories |
| Main Course | 1\. Admin navigates to movie management section 2\. Admin clicks "Add New Movie" button 3\. System displays movie creation form 4\. Admin enters basic movie details (title, release year, duration, etc.) 5\. Admin adds movie description and synopsis 6\. Admin uploads movie poster and media files 7\. Admin adds metadata (categories, episodes, etc.) 9\. Admin submits the form 10\. System validates all information 11\. System creates the movie entry 12\. System confirms successful creation |
| Alternate Courses | **AC1: Draft Saving** \- Movie auto saves as draft \- System stores incomplete information \- Admin can complete later |
| Exceptions | **EX1: Validation Errors** \- If required fields are missing \- System highlights missing fields \- Admin completes required information **EX2: Duplicate Movie** \- If movie already exists \- System shows potential duplicates \- Admin can proceed or cancel **EX3: Media Upload Failure** \- If file upload fails \- System retains form data \- Allows retry of failed uploads |

#### *UC-9.2: View Movie*

| Field | Description |
| :---- | :---- |
| Use Case Name | View Movie |
| Use Case ID | UC-9.2 |
| Description | An administrator views the list of movies or detailed information about a specific movie in the admin dashboard. |
| Actor | Administrator |
| Organizational Benefits | Enables efficient content management and monitoring of the platform's movie catalog. |
| Triggers | \- Admin accesses movie management section \- Admin clicks on a specific movie for details |
| Preconditions | \- Admin is logged into the admin dashboard |
| Postconditions | \- Movie information is displayed \- Admin can proceed with other management actions |
| Main Course | 1\. Admin navigates to movie management section 2\. System displays paginated list of movies 3\. Admin can view basic information in list view 4\. Admin clicks on a movie image 5\. System loads detailed movie information 6\. System displays all movie metadata and status 7\. Admin can review all movie details |
| Alternate Courses | **AC1: Filter and Search** \- Admin applies filters (status, genre, year) \- Admin uses search functionality \- System updates list based on criteria \- Shows matching results count **AC2: Analytics View** \- Admin switches to analytics view \- System shows movie performance metrics \- Displays viewer statistics  |
| Exceptions | **EX1: No Movies Found** \- If no movies match criteria \- System shows empty state message \- Provides suggestions to modify search **EX2: Loading Error** \- If movie details fail to load \- System shows error message \- Provides refresh option **EX3: Permission Denied** \- If user lacks specific view permissions \- System shows limited information \- Indicates restricted access |

#### *UC-9.3: Update Movie*

| Field | Description |
| :---- | :---- |
| Use Case Name | Update Movie |
| Use Case ID | UC-9.3 |
| Description | An administrator modifies existing movie information, metadata, or content on the platform. |
| Actor | Administrator |
| Organizational Benefits | Maintains content accuracy and quality, ensuring up-to-date information for users. |
| Triggers | \- Admin clicks "Edit" on a movie \- Admin selects update option from movie menu |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has content update privileges \- Movie exists in the system |
| Postconditions | \- Movie information is updated \- Search index is refreshed |
| Main Course | 1\. Admin locates movie to update 2\. Admin clicks edit button 3\. System loads movie edit form 4\. System displays current movie information 5\. Admin modifies desired fields 6\. Admin can update media files if needed 7\. Admin submits changes 8\. System validates updates 9\. System saves changes 10\. System updates search index 11\. System confirms successful update |
| Alternate Courses | **AC1: Metadata Update** \- Admin updates only metadata (categories, actors, directors, etc.) \- System fast-tracks metadata changes \- Updates related categorizations  |
| Exceptions | **EX1: Validation Errors** \- If updated data is invalid \- System highlights issues \- Admin corrects and resubmits **EX2: Update Conflict** \- If movie was modified since form load \- The last update will be apply **EX3: Media Update Failure** \- If media file update fails \- System retains existing media \- Allows retry of media upload |

#### *UC-9.4: Delete Movie*

| Field | Description |
| :---- | :---- |
| Use Case Name | Delete Movie |
| Use Case ID | UC-9.4 |
| Description | An administrator removes a movie from the platform, either through soft delete (to recycle bin) or hard delete (permanent removal). |
| Actor | Administrator |
| Organizational Benefits | Maintains platform quality by removing outdated or unwanted content while providing recovery options. |
| Triggers | \- Admin clicks "Delete" on a movie \- Admin accesses recycle bin for hard delete |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has content deletion privileges \- Movie exists in the system |
| Postconditions | \- Movie is moved to recycle bin (soft delete) or permanently removed (hard delete) \- Search index is updated \- Associated resources are handled |
| Main Course | 1\. Admin locates movie to delete 2\. Admin clicks delete button 3\. System shows deletion options dialog 4\. Admin chooses soft or hard delete 5\. System requests confirmation 6\. Admin confirms deletion 7\. System processes deletion 8\. System updates movie status or removes entry 9\. System confirms successful deletion |
| Alternate Courses | **AC1: Soft Delete (Recycle Bin)** \- Movie is marked as deleted \- Moved to recycle bin \- Remains recoverable for set period \- Hidden from user platform **AC2: Hard Delete** \- Admin accesses recycle bin \- Selects movie for permanent deletion \- System removes all associated data \- Cleanup of related resources |
| Exceptions | **EX1: Active References** \- If movie has active user interactions \- System shows reference warning \- Admin can review dependencies **EX2: Restore Period** \- If trying to hard delete before restore period \- System enforces waiting period \- Shows time until permanent deletion |

#### *UC-10.1: Create Category*

| Field | Description |
| :---- | :---- |
| Use Case Name | Create Category |
| Use Case ID | UC-10.1 |
| Description | An administrator creates a new category for organizing movies and content on the platform. |
| Actor | Administrator |
| Organizational Benefits | Improves content organization and discoverability, enhancing user experience and content management. |
| Triggers | \- Admin clicks "Add New Category" button \- Admin initiates category creation process |
| Preconditions | \- Admin is logged into the admin dashboard |
| Postconditions | \- New category is added to the system \- Category is available for content classification \- Category appears in navigation menus |
| Main Course | 1\. Admin navigates to category management section 2\. Admin clicks "Add New Category" button 3\. System displays category creation form 4\. Admin enters category name 5\. Admin provides category description 6\. Admin sets category icon/image (if applicable) 7\. Admin submits the form 8\. System validates category information 9\. System creates the category 10\. System confirms successful creation |
| Alternate Courses |  |
| Exceptions | **EX1: Validation Errors** \- If required fields are missing \- System highlights missing fields \- Admin completes information **EX2: Duplicate Category** \- If category name already exists \- System shows error message \- Admin provides different name |

#### *UC-10.2: View Category*

| Field | Description |
| :---- | :---- |
| Use Case Name | View Category |
| Use Case ID | UC-10.2 |
| Description | An administrator views the list of categories or detailed information about a specific category in the admin dashboard. |
| Actor | Administrator |
| Organizational Benefits | Enables efficient monitoring and management of content organization structure. |
| Triggers | \- Admin accesses category management section \- Admin clicks on a specific category for details |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has category viewing privileges |
| Postconditions | \- Category information is displayed \- Admin can proceed with other management actions |
| Main Course | 1\. Admin navigates to category management section 2\. System displays list of categories 3\. Admin can view basic category information 4\. Admin clicks on category name 5\. System loads detailed category information 6\. System displays associated content count 7\. System shows hierarchy information 8\. Admin can review all category details  |
| Alternate Courses | **AC1: Filter Categories** \- Admin applies filters \- System updates category list \- Shows matching categories  |
| Exceptions | **EX1: No Categories Found** \- If no categories match criteria \- System shows empty state \- Suggests creating categories **EX2: Loading Error** \- If category details fail to load \- System shows error message \- Provides refresh option **EX3: Permission Denied** \- If admin lacks view permissions \- System shows limited information \- Indicates restricted access |

#### *UC-10.3: Update Category*

| Field | Description |
| :---- | :---- |
| Use Case Name | Update Category |
| Use Case ID | UC-10.3 |
| Description | An administrator modifies existing category information or structure on the platform. |
| Actor | Administrator |
| Organizational Benefits | Maintains accurate content organization and adapts to changing content needs. |
| Triggers | \- Admin clicks "Edit" on a category \- Admin selects update option from category menu |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has category update privileges \- Category exists in the system |
| Postconditions | \- Category information is updated \- Associated content is properly categorized \- Navigation menus reflect changes |
| Main Course | 1\. Admin locates category to update 2\. Admin clicks edit button 3\. System loads category edit form 4\. System displays current category information 5\. Admin modifies category details 8\. Admin submits changes 9\. System validates updates 10\. System saves changes 11\. System confirms successful update  |
| Alternate Courses | **AC1: Metadata Update** \- Admin updates only metadata \- System fast-tracks metadata changes \- Updates related categorizations  |
| Exceptions | **EX1: Validation Errors** \- If updated data is invalid \- System highlights issues \- Admin corrects and resubmits **EX2: Content Association** \- If update affects content \- Admin confirms changes  |

#### *UC-10.4: Delete Category*

| Field | Description |
| :---- | :---- |
| Use Case Name | Delete Category |
| Use Case ID | UC-10.4 |
| Description | An administrator removes a category from the platform, handling associated content. |
| Actor | Administrator |
| Organizational Benefits | Maintains clean and relevant content organization structure while ensuring content integrity. |
| Triggers | \- Admin clicks "Delete" on a category \- Admin selects delete option from category menu  |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has category deletion privileges \- Category exists in the system  |
| Postconditions | \- Category is removed from the system \- Associated content is properly handled  |
| Main Course | 1\. Admin locates category to delete 2\. Admin clicks delete button 3\. System checks for associated content 4\. Admin confirms deletion 5\. System processes deletion 6\. System updates category structure 7\. System confirms successful deletion  |
| Alternate Courses | **AC1: Content Reassignment** \- Admin selects target category for content \- System moves associated content \- Updates content categorization  |
| Exceptions | **EX1: Content Dependencies** \- If category has linked content \- System requires content handling \- Prevents orphaned content |

#### *UC-11.1: Create Region*

| Field | Description |
| :---- | :---- |
| Use Case Name | Create Region |
| Use Case ID | UC-11.1 |
| Description | An administrator adds a new region or country to the platform for content organization and localization. |
| Actor | Administrator |
| Organizational Benefits | Enables content organization by geographical regions and supports localization features. |
| Triggers | \- Admin clicks "Add New Region" button \- Admin initiates region creation process |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has region management privileges |
| Postconditions | \- New region is added to the system \- Region is available for content association \- Region appears in filtering options |
| Main Course | 1\. Admin navigates to region management section 2\. Admin clicks "Add New Region" button 3\. System displays region creation form 4\. Admin enters region name 5\. Admin submits the form 6\. System validates region information 7\. System creates the region 8\. System confirms successful creation |
| Alternate Courses |  |
| Exceptions | **EX1: Validation Errors** \- If required fields are missing \- System highlights missing fields \- Admin completes information **EX2: Duplicate Region** \- If region/code already exists \- System shows error message \- Admin provides different details |

#### *UC-11.2: View Region*

| Field | Description |
| :---- | :---- |
| Use Case Name | View Region |
| Use Case ID | UC-11.2 |
| Description | An administrator views the list of regions/countries or detailed information about a specific region. |
| Actor | Administrator |
| Organizational Benefits | Enables efficient monitoring and management of geographical content organization. |
| Triggers | \- Admin accesses region management section \- Admin clicks on a specific region for details |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has region viewing privileges |
| Postconditions | \- Region information is displayed \- Admin can proceed with other management actions  |
| Main Course | 1\. Admin navigates to region management section 2\. System displays list of regions 3\. Admin can view basic region information 4\. Admin clicks on region name 5\. System loads detailed region information 6\. System displays associated content count 7\. System shows hierarchy information 8\. Admin can review all region details  |
| Alternate Courses | **AC1: Filter Regions** \- Admin applies filters (type, status) \- System updates region list \- Shows matching regions  |
| Exceptions | **EX1: No Regions Found** \- If no regions match criteria \- System shows empty state \- Suggests creating regions **EX2: Loading Error** \- If region details fail to load \- System shows error message \- Provides refresh option **EX3: Permission Denied** \- If admin lacks view permissions \- System shows limited information \- Indicates restricted access |

#### *UC-11.3: Update Region*

| Field | Description |
| :---- | :---- |
| Use Case Name | Update Region |
| Use Case ID | UC-11.3 |
| Description | An administrator updates an existing region's information in the system. |
| Actor | Administrator |
| Organizational Benefits | Maintains accurate geographical data for content distribution and user access management. |
| Triggers | \- Admin selects "Edit" on region details \- Admin initiates update from region list |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has region management privileges \- Region exists in the system  |
| Postconditions | \- Region information is updated \- System logs reflect changes \- Content availability is updated for the region \- User access rules are updated if applicable  |
| Main Course | 1\. Admin navigates to region management 2\. Admin locates target region 3\. Admin clicks "Edit" button 4\. System displays editable form 5\. Admin can modify region informations 6\. Admin makes desired changes 7\. System validates modifications 8\. Admin confirms updates 9\. System saves changes 10\. System displays success message  |
| Alternate Courses |  |
| Exceptions | **EX1: Validation Error** \- If input data is invalid \- System shows error messages \- Highlights invalid fields **EX2: Save Failure** \- If update fails \- System retains old data \- Shows error details |

#### *UC-11.4: Delete Region*

| Field | Description |
| :---- | :---- |
| Use Case Name | Delete Region |
| Use Case ID | UC-11.4 |
| Description | An administrator removes a region/country from the platform, handling associated content. |
| Actor | Administrator |
| Organizational Benefits | Maintains clean and relevant geographical organization while ensuring content integrity. |
| Triggers | \- Admin clicks "Delete" on a region \- Admin selects delete option from region menu  |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has region deletion privileges \- Region exists in the system  |
| Postconditions | \- Region is removed from the system \- Associated content is properly handled  |
| Main Course | 1\. Admin locates region to delete 2\. Admin clicks delete button 3\. System checks for associated content 4\. Admin confirms deletion 5\. System processes deletion 6\. System updates region structure 7\. System confirms successful deletion  |
| Alternate Courses | **AC1: Content Reassignment** \- Admin selects target region for content \- System moves associated content \- Updates content region mapping  |
| Exceptions | **EX1: Content Dependencies** \- If region has linked content \- System requires content handling \- Prevents orphaned content  |

#### *UC-12.1: Create Actor*

| Field | Description |
| :---- | :---- |
| Use Case Name | Create Actor |
| Use Case ID | UC-12.1 |
| Description | An administrator adds a new actor to the platform for content association and filmography management. |
| Actor | Administrator |
| Organizational Benefits | Enables proper actor management and association with movies/shows, enhancing content discoverability. |
| Triggers | \- Admin clicks "Add New Actor" button \- Admin initiates actor creation process |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has actor management privileges |
| Postconditions | \- New actor is added to the system \- Actor is available for content association \- Actor appears in search and filtering options |
| Main Course | 1\. Admin navigates to actor management section 2\. Admin clicks "Add New Actor" button 3\. System displays actor creation form 4\. Admin enters actor's full name 5\. Admin adds date of original name 6\. Admin enters actor's biography 7\. Admin uploads actor's profile image 8\. Admin submits the form 9\. System validates actor information 10\. System creates the actor profile 11\. System confirms successful creation |
| Alternate Courses | **AC1: Social Media Links** \- Admin adds social media profiles \- System validates URL formats \- Stores social media information |
| Exceptions | **EX1: Validation Errors** \- If required fields are missing \- System highlights missing fields \- Admin completes information **EX2: Duplicate Actor** \- If actor with same name exists \- System shows potential duplicates \- Admin confirms uniqueness |

#### *UC-12.2: View Actor*

| Field | Description |
| :---- | :---- |
| Use Case Name | View Actor |
| Use Case ID | UC-12.2 |
| Description | An administrator views the list of actors or detailed information about a specific actor. |
| Actor | Administrator |
| Organizational Benefits | Enables efficient monitoring and management of actor profiles and their content associations. |
| Triggers | \- Admin accesses actor management section \- Admin clicks on a specific actor for details |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has actor viewing privileges |
| Postconditions | \- Actor information is displayed \- Admin can proceed with other management actions |
| Main Course | 1\. Admin navigates to actor management section 2\. System displays list of actors 3\. Admin can view basic actor information 4\. Admin clicks on actor name 5\. System loads detailed actor profile 6\. System displays avatar 7\. System shows biographical information 8\. Admin can review all actor details |
| Alternate Courses | **AC1: Advanced Search** \- Admin uses search filters \- System filters by name \- Shows matching actors |
| Exceptions | **EX1: No Actors Found** \- If no actors match criteria \- System shows empty state \- Suggests creating actors **EX2: Loading Error** \- If actor details fail to load \- System shows error message \- Provides refresh option **EX3: Permission Denied** \- If admin lacks view permissions \- System shows limited information \- Indicates restricted access |

#### *UC-12.3: Update Actor*

| Field | Description |
| :---- | :---- |
| Use Case Name | Update Actor |
| Use Case ID | UC-12.3 |
| Description | An administrator updates an existing actor's information in the system. |
| Actor | Administrator |
| Organizational Benefits | Maintains accurate and up-to-date actor profiles for content management. |
| Triggers | \- Admin selects "Edit" on actor profile \- Admin initiates update from actor list |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has actor editing privileges \- Actor exists in the system |
| Postconditions | \- Actor information is updated \- System logs are updated \- Associated content reflects changes |
| Main Course | 1\. Admin navigates to actor profile 2\. Admin clicks "Edit" button 3\. System displays editable form 4\. Admin modifies actor details 5\. Admin can update actor informations 6\. Admin submits changes 7\. System validates input 8\. System saves updates 9\. System confirms success |
| Alternate Courses | **AC1: Partial Update** \- Admin modifies specific fields \- Other fields remain unchanged \- System updates selected data  |
| Exceptions | **EX1: Validation Error** \- If input is invalid \- System shows error messages \- Highlights problem fields **EX2: Duplicate Name** \- If name conflicts exist \- System warns admin \- Requests confirmation **EX3: Save Failure** \- If update fails \- System preserves old data \- Shows error message |

#### *UC-12.4: Delete Actor*

| Field | Description |
| :---- | :---- |
| Use Case Name | Delete Actor |
| Use Case ID | UC-12.4 |
| Description | An administrator removes an actor from the system while managing associated content references. |
| Actor | Administrator |
| Organizational Benefits | Maintains data cleanliness and removes outdated or incorrect actor entries while preserving content integrity. |
| Triggers | \- Admin clicks "Delete" on actor profile \- Admin selects deletion from actor list actions  |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has actor deletion privileges \- Actor exists in the system  |
| Postconditions | \- Actor is removed from the system \- Associated content references are handled \- Search indexes are updated  |
| Main Course | 1\. Admin navigates to actor profile 2\. Admin clicks "Delete" button 3\. System checks for content associations 4\. System displays confirmation dialog 5\. Admin confirms deletion 6\. System processes deletion 7\. System removes actor data 8\. System confirms successful removal  |
| Alternate Courses |  |
| Exceptions | **EX1: Permission Error** \- If admin lacks full rights \- System shows permission error \- Suggests requesting access |

#### *UC-13.1: Create Director*

| Field | Description |
| :---- | :---- |
| Use Case Name | Create Director |
| Use Case ID | UC-13.1 |
| Description | An administrator adds a new director to the platform for content association and filmography management. |
| Actor | Administrator |
| Organizational Benefits | Enables proper director management and association with movies/shows, enhancing content organization and searchability. |
| Triggers | \- Admin clicks "Add New Director" button \- Admin initiates director creation process  |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has director management privileges  |
| Postconditions | \- New director is added to the system \- Director is available for content association \- Director appears in search and filtering options  |
| Main Course | 1\. Admin navigates to director management section 2\. Admin clicks "Add New Director" button 3\. System displays director creation form 4\. Admin enters director's full name 6\. Admin enters director's original name 7\. Admin uploads director's profile image 8\. Admin submits the form 9\. System validates director information 10\. System creates the director profile 11\. System confirms successful creation |
| Alternate Courses |  |
| Exceptions | **EX1: Validation Errors** \- If required fields are missing \- System highlights missing fields \- Admin completes information **EX2: Duplicate Director** \- If director with same name exists \- System shows potential duplicates \- Admin confirms uniqueness  |

#### *UC-13.2: View Director*

| Field | Description |
| :---- | :---- |
| Use Case Name | View Director |
| Use Case ID | UC-13.2 |
| Description | An administrator views the list of directors or detailed information about a specific director. |
| Actor | Administrator |
| Organizational Benefits | Enables efficient monitoring and management of director profiles and their content associations. |
| Triggers | \- Admin accesses director management section \- Admin clicks on a specific director for details |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has director viewing privileges |
| Postconditions | \- Director information is displayed \- Admin can proceed with other management actions |
| Main Course | 1\. Admin navigates to director management section 2\. System displays list of directors 3\. Admin can view basic director information 4\. Admin clicks on director name 5\. System loads detailed director profile 6\. System displays avatar 7\. System shows biographical information 8\. Admin can review all director details 9\. System displays associated content count 10\. System shows awards and achievements |
| Alternate Courses | **AC1: Advanced Search** \- Admin uses search filters \- System filters by name/nationality/status \- Shows matching directors  |
| Exceptions | **EX1: No Directors Found** \- If no directors match criteria \- System shows empty state \- Suggests creating directors **EX2: Loading Error** \- If director details fail to load \- System shows error message \- Provides refresh option **EX3: Permission Denied** \- If admin lacks view permissions \- System shows limited information \- Indicates restricted access |

#### *UC-13.3: Update Director*

| Field | Description |
| :---- | :---- |
| Use Case Name | Update Director |
| Use Case ID | UC-13.3 |
| Description | An administrator updates an existing director's information in the system. |
| Actor | Administrator |
| Organizational Benefits | Maintains accurate and up-to-date director profiles for content management and user experience. |
| Triggers | \- Admin selects "Edit" on director profile \- Admin initiates update from director list |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has director editing privileges \- Director exists in the system |
| Postconditions | \- Director information is updated \- System logs are updated \- Associated content reflects changes \- Search indexes are refreshed |
| Main Course | 1\. Admin navigates to director profile 2\. Admin clicks "Edit" button 3\. System displays editable form 4\. Admin modifies director details 5\. Admin can update director informations 6\. Admin submits changes 7\. System validates input 8\. System saves updates 9\. System confirms success |
| Alternate Courses | **AC1: Partial Update** \- Admin modifies specific fields \- Other fields remain unchanged \- System updates selected data **AC2: Image Update** \- Admin updates profile image \- System processes new image \- Updates display picture  |
| Exceptions | **EX1: Validation Error** \- If input is invalid \- System shows error messages \- Highlights problem fields **EX2: Duplicate Name** \- If name conflicts exist \- System warns admin \- Requests confirmation **EX4: Save Failure** \- If update fails \- System preserves old data \- Shows error message |

#### *UC-13.4: Delete Director*

| Field | Description |
| :---- | :---- |
| Use Case Name | Delete Director |
| Use Case ID | UC-13.4 |
| Description | An administrator removes a director from the system while managing associated content references. |
| Actor | Administrator |
| Organizational Benefits | Maintains data cleanliness and removes outdated or incorrect director entries while preserving content integrity.  |
| Triggers | \- Admin clicks "Delete" on director profile \- Admin selects deletion from director list actions  |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has director deletion privileges \- Director exists in the system  |
| Postconditions | \- Director is removed from the system \- Associated content references are handled \- Search indexes are updated  |
| Main Course | 1\. Admin navigates to director profile 2\. Admin clicks "Delete" button 3\. System checks for content associations 4\. System displays confirmation dialog 5\. Admin confirms deletion 6\. System processes deletion 7\. System removes director data 8\. System confirms successful removal  |
| Alternate Courses |  |
| Exceptions | **EX1: Partial Failure** \- If some references remain \- System shows failed items \- Allows retry or skip **EX2: Permission Error** \- If admin lacks full rights \- System shows permission error \- Suggests requesting access |

#### *UC-14.1: View User*

| Field | Description |
| :---- | :---- |
| Use Case Name | View User |
| Use Case ID | UC-14.1 |
| Description | An administrator views the list of users or detailed information about a specific user. |
| Actor | Administrator |
| Organizational Benefits | Enables efficient user management and monitoring of user activities and status. |
| Triggers | \- Admin accesses user management section \- Admin clicks on a specific user for details |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has user viewing privileges |
| Postconditions | \- User information is displayed \- Admin can proceed with other management actions |
| Main Course | 1\. Admin navigates to user management section 2\. System displays list of users with: \- Avatar/Profile picture \- User ID \- Email \- Email verification status \- Full name \- Role (Admin/Member) \- Account status (Active/Blocked) 3\. Admin can sort by: \- ID \- Email \- Full name \- Role \- Status 4\. Admin clicks on user for details 5\. System displays detailed user profile: \- Profile image \- Basic information \- Account status \- Account history \- Block log history |
| Alternate Courses | **AC1: Advanced Search** \- Admin uses search functionality \- System searches by keywords \- Shows matching users **AC2: Filter View** \- Admin applies filters: \- Email verification \- Role type \- Account status \- System shows filtered results **AC3: Refresh List** \- Admin refreshes user list \- System updates with latest data \- Shows updated user statuses |
| Exceptions | **EX1: No Users Found** \- If no users match criteria \- System shows empty state \- Provides search/filter reset **EX2: Loading Error** \- If user details fail to load \- System shows error message \- Provides refresh option **EX3: Permission Denied** \- If admin lacks view permissions \- System shows limited information \- Indicates restricted access |

#### *UC-14.2: Block User*

| Field | Description |
| :---- | :---- |
| Use Case Name | Block User |
| Use Case ID | UC-14.2 |
| Description | An administrator blocks a user's account to prevent system access. |
| Actor | Administrator |
| Organizational Benefits | Provides control over user access and helps maintain platform security and content quality. |
| Triggers | \- Admin clicks block button on user profile \- Admin initiates block action from user list |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has user blocking privileges \- User account is active \- Target user is not the current admin |
| Postconditions | \- User account is blocked \- Block log is updated \- User status is updated in listings |
| Main Course | 1\. Admin navigates to user profile 2\. Admin verifies user status is active 3\. Admin clicks block button 4\. System displays confirmation dialog 5\. Admin provides block reason 6\. Admin confirms block action 7\. System processes block request 8\. System updates user status 9\. System records block in activity log 10\. System shows success message |
| Alternate Courses | **AC1: Block from List View** \- Admin selects user from list \- Initiates block action \- Provides block reason \- Confirms action **AC2: Temporary Block** \- Admin specifies block duration \- System sets expiration \- Schedules automatic unblock |
| Exceptions | **EX1: Self-Block Prevention** \- If admin attempts self-block \- System prevents action \- Shows warning message **EX2: Already Blocked** \- If user is already blocked \- System shows current status \- Offers unblock option **EX3: Missing Reason** \- If block reason not provided \- System requires input \- Prevents confirmation **EX4: Permission Error** \- If admin lacks rights \- System shows error \- Denies action |

#### *UC-14.3: Unblock User*

| Field | Description |
| :---- | :---- |
| Use Case Name | Unblock User |
| Use Case ID | UC-14.3 |
| Description | An administrator removes a block from a user's account to restore system access. |
| Actor | Administrator |
| Organizational Benefits | Allows restoration of user access after resolution of issues or expiration of penalties. |
| Triggers | \- Admin clicks unblock button on blocked user profile \- Admin initiates unblock action from user list |
| Preconditions | \- Admin is logged into the admin dashboard \- Admin has user unblocking privileges \- User account is currently blocked |
| Postconditions | \- User account is unblocked \- Block log is updated with unblock action \- User status is updated in listings |
| Main Course | 1\. Admin navigates to user profile 2\. Admin verifies user is blocked 3\. Admin clicks unblock button 4\. System displays confirmation dialog 5\. Admin provides unblock reason 6\. Admin confirms unblock action 7\. System processes unblock request 8\. System updates user status to active 9\. System records unblock in activity log 10\. System shows success message |
| Alternate Courses | **AC1: Unblock from List View** \- Admin selects blocked user from list \- Initiates unblock action \- Provides unblock reason \- Confirms action |
| Exceptions | **EX1: Not Blocked** \- If user is not blocked \- System shows current status \- Prevents unblock action **EX2: Missing Reason** \- If unblock reason not provided \- System requires input \- Prevents confirmation **EX3: Permission Error** \- If admin lacks rights \- System shows error \- Denies action |
