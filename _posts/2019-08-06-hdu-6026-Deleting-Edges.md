---
title: "hdu 6026 Deleting Edges"
date: 2019-08-06 20:27:23
description: "Little Q is crazy about graph theory, and now he creates a game about graphs and trees. …"
tags: [HDU, 图论, 搜索]
category: "ACM"
---

# hdu 6026 Deleting Edges

## <span style="color:#1a5cc8;">Deleting Edges</span>

**Time Limit: 2000/1000 MS \(Java/Others\)    Memory Limit: 131072/131072 K \(Java/Others\)
Total Submission\(s\): 2224    Accepted Submission\(s\): 742** 


Problem Description

Little Q is crazy about graph theory, and now he creates a game about graphs and trees\.
There is a bi\-directional graph with *n* nodes, labeled from 0 to *n* −1\. Every edge has its length, which is a positive integer ranged from 1 to 9\.
Now, Little Q wants to delete some edges \(or delete nothing\) in the graph to get a new graph, which satisfies the following requirements:
\(1\) The new graph is a tree with *n* −1 edges\.
\(2\) For every vertice *v* \(0< *v* < *n* \), the distance between 0 and *v* on the tree is equal to the length of shortest path from 0 to *v* in the original graph\.
Little Q wonders the number of ways to delete edges to get such a satisfied graph\. If there exists an edge between two nodes *i* and *j* , while in another graph there isn't such edge, then we regard the two graphs different\.
Since the answer may be very large, please print the answer modulo 109\+7\.

Input

The input contains several test cases, no more than 10 test cases\.
In each test case, the first line contains an integer *n* \(1≤ *n* ≤50\), denoting the number of nodes in the graph\.
In the following *n* lines, every line contains a string with *n* characters\. These strings describes the adjacency matrix of the graph\. Suppose the *j* \-th number of the *i* \-th line is *c* \(0≤ *c* ≤9\), if *c* is a positive integer, there is an edge between *i* and *j* with length of *c* , if *c* =0, then there isn't any edge between *i* and *j* \.
The input data ensure that the *i* \-th number of the *i* \-th line is always 0, and the *j* \-th number of the *i* \-th line is always equal to the *i* \-th number of the *j* \-th line\.

Output

For each test case, print a single line containing a single integer, denoting the answer modulo 109\+7\.

Sample Input

2 01 10 4 0123 1012 2101 3210

Sample Output

1 6

直达今天我才知道，原来dijkstra算法就是一个bfs。我觉得我现在会dijkstra了。

```
#include <bits/stdc++.h>
using namespace std;
using P=pair<int,int>;
priority_queue<P,vector<P>,greater<P> >pq;
const int mod=1e9+7;
const int maxn=105;
const int inf=1e9+7;
int n;
char dis[maxn][maxn];
int dp[maxn];//dp[i]±íÊ¾´Ó0µ½iµãµÄ×î¶Ì¾àÀë 
bool vis[maxn];
long long ans=1;
void bfs_Or_dijkstra()
{
	while(!pq.empty())
	{
		int u=pq.top().second,num=0;;
		pq.pop();
		if(vis[u])continue;
		vis[u]=1;
		for(int i=0;i<n;i++)
		{
			if(vis[u] && dis[u][i]==0)continue;
			if(dp[i] > dp[u]+dis[u][i])
			{
				dp[i] = dp[u]+dis[u][i];
				pq.push(P(dp[i],i));
			}
		}
		if(u)
		{
			for(int i=0;i<n;i++)
			{
				if(dis[u][i] && vis[u] && dp[i]==dp[u]-dis[u][i])num++;
			}
			ans=ans*num%mod;
		}
	}
	for(int i=0;i<n;i++)if(!vis[i])ans=0; 
}
void clearAndinit()
{
	while(!pq.empty())pq.pop();//Çå¿ÕÓÅÏÈ¶ÓÁÐ
	dp[0]=0;
	ans=1;
	pq.push(P(0,0));//¾àÀëÎª0£¬0ºÅ½Úµã
}
int main()
{
	while(scanf("%d%*c",&n)==1)
	{
		for(int i=0;i<n;i++)
		{
			scanf("%s",dis[i]);
			for(int j=0;j<n;j++)
			{
				dis[i][j]-='0';
			}
			dp[i]=inf;//³õÊ¼»¯¾àÀëÎªÎÞÇî´ó 
			vis[i]=0;//µ±Ç°µãÎª·ÃÎÊ 
		}
		clearAndinit();
		bfs_Or_dijkstra();
		printf("%lld\n",ans);
	}
}
```