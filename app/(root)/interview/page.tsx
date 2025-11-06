import React from "react";
import Agent from "@/components/Agent";


const Page = () => {
  return (
    <>
    <h3>Interview Generation</h3>
    
    <Agent userName="You" userId="user1" type="generate" />
    </>
  )
}

export default Page;





//    <Agent userName="you" userID="user1" type="generate" />




// import { getCurrentUser } from "@/lib/actions/auth.action";

// const Page = async () => {
//   const user = await getCurrentUser();

//   return (
//     <>
//       <h3>Interview generation</h3>

//       <Agent
//         userName={user?.name!}
//         userId={user?.id}
//         profileImage={user?.profileURL}
//         type="generate"
//       />
//     </>
//   );
// };


