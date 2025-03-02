import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: #3995db;
  font-weight: 900;
  color: white;
  font-size: 20px;
  width: 200px;
  cursor: pointer;
  box-shadow: 5px 5px 0px rgba(255,255,255,0.9);
  
  //box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  //-webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  //-moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: #3995db;
  padding: 10px;
  font-weight: bold;
  font-size: 30px;
  color: var(--primary-text);
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px solid var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  margin: 36px 0;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

export const StyledVideo = styled.div`
  object-fit: cover;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
  async function loopAvatars(imageElId, avatarIds) {
    for (let i = 0; true; i++) {
      //transition with tv static
      if (document.getElementById(imageElId)) {
        document.getElementById(imageElId).src = `/config/images/static.gif`;
        await delay(750);
      }

      //insert next avatar
      if (document.getElementById(imageElId)) {
        document.getElementById(imageElId).src = `/config/images/avatars/${avatarIds[i]}.png`;
        await delay(1500);
      }

      if (i === avatarIds.length - 1) { i = -1 } //turns into 0 after increment
    }
  }

  window.addEventListener('DOMContentLoaded', (event) => {
    loopAvatars('topAvatarsImg', [53, 109, 139, 143, 29, 22, 118, 140, 144, 3]);
    loopAvatars('avatarSynthsImg', [3, 29, 39, 46, 150, 196]);
    loopAvatars('avatarDjsImg', [53, 22, 76, 106, 142]);
    loopAvatars('avatarGuitarsImg', [109, 118, 124, 155, 166]);
    loopAvatars('avatarMicsImg', [139, 140, 161, 170, 187, 229]);
    loopAvatars('avatarDrumsImg', [143, 144, 145, 242, 290]);
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 2) {
      newMintAmount = 2;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)", zIndex: 0 }}
      >
            {/* Background video */}
            <StyledVideo>
          <video playsInline autoPlay muted loop id="myVideo" style={{width: '100%' }} poster="/config/images/video_cover.png">
            <source src="/config/images/bg.mp4" type="video/mp4"></source>
          </video>
          <video playsInline autoPlay muted loop id="myVideo" style={{width: '100%'}} poster="/config/images/video_cover.png">
            <source src="/config/images/bg.mp4" type="video/mp4"></source>
          </video>
          <video playsInline autoPlay muted loop id="myVideo" style={{width: '100%'}} poster="/config/images/video_cover.png">
            <source src="/config/images/bg.mp4" type="video/mp4"></source>
          </video>
        </StyledVideo>

        {/* Navbar */}
        <div style={{width: '100%', textAlign: 'center' }}>

          <div style={{ position: 'absolute', top: 0, left: 0, margin: '5px 0 0 0'  }}>
            {/*<a target={'_blank'} href={''} style={{visibility: 'hidden'}}>*/}
            {/*  <i className="fab fa-discord" style={{color: 'white', fontSize: '3rem', marginLeft: '2rem'}}></i>*/}
            {/*</a>*/}
            {/* <a target={'_blank'} href={'https://twitter.com/musicavatars'}>
              <i className="fab fa-twitter" style={{color: 'white', backgroundColor: '#1D9BF0', fontSize: '1.25rem', margin: '.25em', padding: '.5rem', borderRadius: '1rem', marginLeft: '0.5rem', boxShadow: '2px 2px 0px rgba(255,255,255,0.9)' }}></i>
            </a> */}

<a target={'_blank'} href={'https://opensea.io/collection/music-avatars'} >
             <img width={44} height={44} src={'/config/images/open-sea.png'} alt={'Open Sea logo'} style={{marginLeft: '0.15rem', paddingTop:'10px', paddingLeft:'10px'}}/>
            </a> 

            <a target={'_blank'} href={'https://etherscan.io/token/0x20D975eB2352f2c26b8869cC99Eac00cEF2f522B'} >
             <img width={44} height={44} src={'/config/images/etherscan.png'} alt={'Open Sea logo'} style={{marginLeft: '0.15rem', paddingTop:'10px', paddingLeft:'10px'}}/>
            </a> 

        
           
{/* 
            <a target={'_blank'} href={'https://www.instagram.com/musicavatars/'}>
              <i className="fab fa-instagram" style={{color: 'white', backgroundColor: '#BA5287', fontSize: '1.25rem', margin: '.25em', padding: '.5rem', borderRadius: '1rem', marginLeft: '0.25rem', boxShadow: '2px 2px 0px rgba(255,255,255,0.9)' }}></i>
            </a> */}

 

            
           
          </div>


          <s.TextTitleSpan
              style={{
                fontSize: '2.5rem',
                fontWeight: "900",
                textShadow: `3px 3px 0px rgba(255,149,212,0.9)`,
                fontStyle: 'italic',
                justifyContent: 'center',
            
                
              }}
          >
            Music Avatars
          </s.TextTitleSpan>

        </div>

        {/* Title */}
        {/*<div style={{width: "100%"}}>*/}
        {/*  <s.TextTitle*/}
        {/*      style={{*/}
        {/*        textAlign: "center",*/}
        {/*        fontSize: '6vw',*/}
        {/*        width: '100%',*/}
        {/*        fontWeight: "900",*/}
        {/*        textShadow: `3px 3px 0px rgba(255,149,212,0.9)`,*/}
        {/*        fontStyle: 'italic',*/}
        {/*      }}*/}
        {/*  >*/}
        {/*    Music Avatars*/}
        {/*  </s.TextTitle>*/}
        {/*</div>*/}

        <s.SpacerMedium/>

        {/* Description container */}
        <ResponsiveWrapper flex={1} test style={{maxWidth: '1000px',}}>
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: '#FF3CAC',
              backgroundImage: 'linear-gradient(225deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)',
              padding: 36,
              borderRadius: 15,
              boxShadow: '8px 8px 0px rgba(255,255,255,0.8)',
            }}
          >
            <s.TextTitle
                style={{
                  textAlign: "center",
                  fontSize: 30,
                  fontWeight: "900",
                  color: "var(--accent-text)",
                  textShadow: `3px 3px 0px rgba(76,109,181,0.9)`,
                }}
            >
              Unique Music Identities, One Community
            </s.TextTitle>

            <s.SpacerMedium/>

            <s.TextTitle
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  color: "var(--accent-text)",
                }}
            >
              Music Avatars is a free-to-mint PFP collection of 10,000 NFTs for Artists and Music Enthusiasts. <br/><br/>This collection of NFTs capture the moment where an artist/musician is one with their instrument. 

        

               

             


              


            </s.TextTitle>

            {/* <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall /> */}

            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                {/*<s.TextTitle*/}
                {/*  style={{ textAlign: "center", color: "var(--accent-text)" }}*/}
                {/*>*/}
                {/*  1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}*/}
                {/*  {CONFIG.NETWORK.SYMBOL}.*/}
                {/*</s.TextTitle>*/}

                {/*<s.SpacerXSmall />*/}

                {/*<s.TextDescription*/}
                {/*  style={{ textAlign: "center", color: "var(--accent-text)" }}*/}
                {/*>*/}
                {/*  Excluding gas fees.*/}
                {/*</s.TextDescription>*/}

                {/*<s.SpacerSmall />*/}

                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    {/*<s.TextDescription*/}
                    {/*  style={{*/}
                    {/*    textAlign: "center",*/}
                    {/*    color: "var(--accent-text)",*/}
                    {/*  }}*/}
                    {/*>*/}
                    {/*  Connect to the {CONFIG.NETWORK.NAME} network*/}
                    {/*</s.TextDescription>*/}
                    {/*<s.SpacerSmall />*/}

                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    {/*<s.TextDescription*/}
                    {/*  style={{*/}
                    {/*    textAlign: "center",*/}
                    {/*    color: "var(--accent-text)",*/}
                    {/*  }}*/}
                    {/*>*/}
                    {/*  {feedback}*/}
                    {/*</s.TextDescription>*/}
                    {/*<s.SpacerMedium />*/}
                  </>
                )}
              </>
            )}
          </s.Container>
        </ResponsiveWrapper>

        <s.SpacerSmall/>  {/* Use small in addition to standard medium because container shadow takes up unconsidered space */}
        <s.SpacerMedium/>

        {/* Description container */}
        <ResponsiveWrapper flex={1} test style={{maxWidth: '1000px',}}>
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              borderRadius: 10,
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: '1.5rem 1rem',
            }}
          >
            <s.TextTitle
                style={{
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: 900,
                  color: "var(--accent-text)",
                }}
            >
              🤘
            Avatars for Forward Thinking Artists & Musicians
              🤘
            </s.TextTitle>
          </s.Container>
        </ResponsiveWrapper>

        {/*<s.Container*/}
        {/*    flex={2}*/}
        {/*    jc={"center"}*/}
        {/*    ai={"center"}*/}
        {/*    style={{*/}
        {/*      // backgroundColor: "#2e292c",*/}

        {/*      // backgroundColor: '#4158D0',*/}
        {/*      // backgroundImage: 'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',*/}

        {/*      // backgroundColor: '#4158D0',*/}
        {/*      // backgroundImage: 'linear-gradient(43deg, #4158D0 24%, #C850C0 70%, #FFCC70 100%)',*/}

        {/*      // Picked from: https://cssgradient.io/gradient-backgrounds/*/}
        {/*      backgroundColor: '#FF3CAC',*/}
        {/*      backgroundImage: 'linear-gradient(225deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)',*/}

        {/*      padding: 24,*/}
        {/*      borderRadius: 24,*/}
        {/*      boxShadow: '8px 8px 0px rgba(255,255,255,0.8)',*/}
        {/*      maxWidth: 936,*/}
        {/*    }}*/}
        {/*>*/}

        <s.SpacerMedium/>

        {/* Avatars examples */}
        <s.Container flex={1} jc={"center"} ai={"center"}>
          <StyledImg
              id={"topAvatarsImg"}
              width={300}
              height={300}
              alt={"example"}
              src={"/config/images/avatars/3.png"}
              style={{ transform: "scaleX(-1)", margin: 0, }}
          /><br></br>


          {/* Description container */}
        <ResponsiveWrapper flex={1} test style={{maxWidth: '1000px',}}>
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              borderRadius: 10,
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: '1.5rem 1rem',
            }}
          >
            <s.TextTitle
                style={{
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: 900,
                  color: "var(--accent-text)",
                }}
            >

              
           Connect your Wallet to Mint 2 Music Avatars for FREE <br></br>(as supplies last - gas excluded)
            </s.TextTitle>
          </s.Container>
        </ResponsiveWrapper>
<br></br>


          {/* Description container */}
          <ResponsiveWrapper flex={1} test style={{maxWidth: '1000px',}}>
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              borderRadius: 10,
              // backgroundColor: 'rgba(0,0,0,0.7)',
              padding: '1.5rem 1rem',
            }}
          >
            <s.TextTitle
                style={{
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: 900,
                  color: "var(--accent-text)",
                }}
            >

       
       
<div style={{float: 'right', }}    >
            { blockchain.account === "" || blockchain.smartContract === null ? (
                <span>
                  <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                      style={{  width: 300, fontSize: '1.5rem', padding: '18px 0'}}
                  >
                    CONNECT WALLET
                  </StyledButton>
                </span>
            ) : (
                <span>
                  <StyledButton
                      style={{  width: 300, fontSize: '1.5rem', padding: '18px 0', backgroundColor: '#28A745' }}
                  >
                    CONNECTED
                  </StyledButton>
                </span>
            )}
          </div>





            </s.TextTitle>
          </s.Container>
        </ResponsiveWrapper>
<br></br>









{/* <StyledButton
        
        style={{width: '100%', padding: '1.5rem 0', maxWidth: '300px', borderRadius: '1rem', fontSize: 25, backgroundColor: '#db3995', fontStyle: 'italic' }}
     >


     <a target={'_blank'} href="https://discord.gg/z3gwBB8w2Z">  JOIN OUR DISCORD</a><br></br>
     </StyledButton> */}


        </s.Container>

        <s.SpacerMedium/>

        {/* Show mint button if wallet connected */}
        { blockchain.account === "" || blockchain.smartContract === null ? (
            <s.Container ai={"center"} jc={"center"} fd={"row"} >


          
          </s.Container>
        ) : (
            <s.Container ai={"center"} jc={"center"} fd={"row"} style={{marginBottom:'2rem'}}>
              <s.SpacerLarge />
              <StyledRoundButton
                  style={{ lineHeight: 0.4, marginRight: '1rem' }}
                  disabled={claimingNft ? 1 : 0}
                  onClick={(e) => {
                    e.preventDefault();
                    decrementMintAmount();
                  }}
              >
                -
              </StyledRoundButton>

              <StyledButton
                  disabled={claimingNft ? 1 : 0}
                  onClick={(e) => {
                    e.preventDefault();
                    claimNFTs();
                    getData();
                  }}
                  style={{width: '100%', padding: '1rem 0', maxWidth: '400px', borderRadius: '1rem', fontSize: 25, fontWeight: '900', backgroundColor: '#3995db'}}
              >
                {claimingNft ? "BUSY" : `MINT ${mintAmount} AVATAR`}
              </StyledButton>

              <StyledRoundButton
                  disabled={claimingNft ? 1 : 0}
                  onClick={(e) => {
                    e.preventDefault();
                    incrementMintAmount();
                  }}
                  style={{marginLeft: '1rem'}}
              >
                +
              </StyledRoundButton>
            </s.Container>
        )}

        

        <s.SpacerMedium/>
        <s.SpacerSmall/>  {/* Use small in addition to standard medium because container shadow takes up unconsidered space */}

        <s.Container jc={"center"} ai={"left"}
         style={{
           maxWidth: 936,
           // Picked from: https://cssgradient.io/gradient-backgrounds/
           backgroundColor: '#FF3CAC',
           backgroundImage: 'linear-gradient(225deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)',
           padding: 36,
           borderRadius: 24,
           boxShadow: '8px 8px 0px rgba(255,255,255,0.8)',
         }}
        >
          {/* Avatar synths */}
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
                id={"avatarSynthsImg"}
                width={300}
                height={300}
                alt={"example"}
                src={"/config/images/avatars/196.png"}
                style={{ transform: "scaleX(-1)"}}
            />
          </s.Container>

<s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >

What is the vision for Music Avatars? </s.TextDescription>


<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",
              fontSize: '18px',
            }}
          >

Music Avatars aims to be a community of like-minded creators/artists/enthusiasts bound by their genuine love for music.  
  <br/>
  <br/>

  Each NFT is unique and consists of either a string instrument, mic, DJ set, synthesizer, or drum with distinct facial features.
  <br/>
  <br/>

  When you hold a Music Avatar NFT, you own all commercial and publishing rights associated with the image. We envision a future where strong brands are built upon Music Avatar NFTs by forward thinking artists and musicians.
  <br/>
  <br/>
</s.TextDescription>

  


        

          {/* <s.TextDescription
              style={{
                textAlign: "left",
                color: "white",
                fontWeight: '900',
                fontStyle: 'italic',
                fontSize: '40px',
              }}
          >
            What are the benefits of holding a Music Avatar NFT? </s.TextDescription>

          <s.TextDescription
              style={{
                textAlign: "left",
                color: "var(--primary-text)",

                fontSize: '18px',
              }}
          >
As a Music Avatar hodler, you hold the copyright of the NFT and can do with it commercially anything you please.  <br/>
  <br/>

You also get access to the items below once we hit each percentage of the Music Avatars public mint: 
          </s.TextDescription>

          <ul style={{ color: 'white', fontSize: '18px',  }}>
            <li style={{marginTop: '20px',}}><span style={{ fontSize: '23px', fontStyle: 'italic', marginRight: '1rem'}}> ⭐️ 00% </span> Access to a community of songwriters, producers, artists and developers </li>
            <li style={{marginTop: '20px',}}><span style={{ fontSize: '23px', fontStyle: 'italic', marginRight: '1rem'}}> ⭐️ 50% </span> Dedicated Youtube Channel promoting Music Avatar Artists </li>
    
            <li style={{marginTop: '20px',}}><span style={{ fontSize: '23px', fontStyle: 'italic', marginRight: '1rem'}}> ⭐️ 100%+ </span> The Music Avatars Songboard </li>
          </ul>

          <br/>
  <br/> */}





          {/* Avatar djs */}
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
                id={"avatarDjsImg"}
                width={300}
                height={300}
                alt={"example"}
                src={"/config/images/avatars/142.png"}
                style={{ transform: "scaleX(-1)"}}
            />
          </s.Container>

          <s.TextDescription
              style={{
                textAlign: "left",
                color: "white",
                fontWeight: '900',
                fontStyle: 'italic',
                fontSize: '40px',
              }}
          >
            What can I do with a Music Avatar? </s.TextDescription>

          <s.TextDescription
              style={{
                textAlign: "left",
                color: "var(--primary-text)",
                fontSize: '18px',
              }}
          >
Music Avatars provide a unique visual and musical identity that helps you stand out as an individual as well as be part of a community of like-minded folk. 
   <br/>
  <br/>

  As a Music Avatar NFT hodler, you can use your NFT as the face of your brand, online identity (profile picture), on album covers, stickers, etc. What you choose to do with it is left upto you. Any income you generate by licensing your NFT is also yours to keep.

          </s.TextDescription>

       


          {/* <s.TextDescription
              style={{
                textAlign: "left",
                color: "white",
                fontWeight: '900',
                fontStyle: 'italic',
                fontSize: '40px',
              }}
          >
            What is the Music Avatars Songboard? </s.TextDescription>

          <s.TextDescription
              style={{
                textAlign: "left",
                color: "var(--primary-text)",
                fontSize: '18px',
              }}
          >

We envision The Music Avatars Songboard as being a place where musicians, producers and artists can come together to work and release music together irrespective of where they live or who they know. <br/><br/>

We have no plans of competing with Music NFT platforms or protocols. Our only goal is to facilitate more collaboration with likeminded people and release great music in the world.<br/><br/>


If this resonates with you, come help us build the Music Avatars Songboard. 

          </s.TextDescription> */}


   {/* Avatar drums */}
   <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
                id={"avatarDrumsImg"}
                width={300}
                height={300}
                alt={"example"}
                src={"/config/images/avatars/290.png"}
                style={{ transform: "scaleX(-1)"}}
            />
          </s.Container>

          

          <s.TextDescription
              style={{
                textAlign: "left",
                color: "white",
                fontWeight: '900',
                fontStyle: 'italic',
                fontSize: '40px',
              }}
          >

            Who are Music Avatars for? </s.TextDescription>



          <s.TextDescription
              style={{
                textAlign: "left",
                color: "var(--primary-text)",

                fontSize: '18px',
              }}
          >

Music Avatars are primarily geared towards artists/musicians/creatives but open to music enthusiasts worldwide.<br/><br/></s.TextDescription>

       
           {/* Avatar guitars */}
           <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
                id={"avatarGuitarsImg"}
                width={300}
                height={300}
                alt={"example"}
                src={"/config/images/avatars/166.png"}
                style={{ transform: "scaleX(-1)"}}
            />
          </s.Container>

<s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >

How much does it cost to mint a Music Avatar?  </s.TextDescription>


<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",

              fontSize: '18px',
            }}
          >
Music Avatars are FREE to mint. You have the opportunity of minting 2 NFTs on this website. Music Avatars live on the Ethereum blockchain. <br/>   <br/>

If the free public mint is sold out, you can purchase an NFT through the secondary market on <a href={'https://opensea.io/collection/music-avatars'} target={'_blank'} style={{color: 'white', marginRight: '5px'}}><i className="fas fa-external-link-square-alt" style={{marginRight: '5px'}}/>Opensea.</a>

<br/>   <br/>

 </s.TextDescription>

          <s.SpacerMedium/>



             {/* Avatar mics */}
             <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
                id={"avatarMicsImg"}
                width={300}
                height={300}
                alt={"example"}
                src={"/config/images/avatars/229.png"}
                style={{ transform: "scaleX(-1)"}}
            />
          </s.Container>



<s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >

How many Music Avatar are available for mint?</s.TextDescription>

          <s.SpacerMedium/>

<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",

              fontSize: '18px',
            }}
          >
 There are 10,000 NFTs in total of which 99% will be available for the public mint. 1% of NFTs will be reserved for the founder.  </s.TextDescription>

          <s.SpacerMedium/>

 

 

<s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >

What started this project?  </s.TextDescription>



<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",

              fontSize: '18px',
            }}
          >
            <span>
             

            Music Avatars was founded by <a href={'https://twitter.com/kolourrmusic'} target={'_blank'} style={{color: 'white', marginRight: '5px'}}><i className="fas fa-external-link-square-alt" style={{marginRight: '5px'}}/>Bruce Rebello (aka Kolourr)</a>, artist and engineer, as an experiment to interlink the PFP NFT world with musicians and artists.  <br></br> <br></br>  
            
            <a href={'https://twitter.com/DonaldBough'} target={'_blank'} style={{color: 'white', marginRight: '5px'}}><i className="fas fa-external-link-square-alt" style={{marginRight: '5px'}}/> Donald Bough</a>helped with building this website.     
                  
                None of this would be possible without <a href={'https://twitter.com/Hashlipsnft'} target={'_blank'} style={{color: 'white', marginRight: '5px'}}>
                <i className="fas fa-external-link-square-alt" style={{marginRight: '5px'}}/>
                Daniel "Hashlips"</a> amazing NFT and solidity tutorials.    
      

                

 


            
              
            </span>
            
        
             </s.TextDescription>





 

        

<s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >

Note  </s.TextDescription>

<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",

              fontSize: '18px',
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action. We have set the gas limit to 225000 for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription>


          <s.SpacerSmall />

        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
